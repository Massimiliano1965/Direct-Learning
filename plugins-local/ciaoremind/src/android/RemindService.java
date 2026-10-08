package it.metododiretto.ciaoremind;

import android.app.KeyguardManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.provider.Settings;
import android.util.Base64;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

/**
 * Il promemoria allo sblocco (ripreso dal blocco di StudyGame, ma non blocca niente):
 * quando l'allievo sblocca il telefono, appare l'insegnante con una frase già imparata e tre tasti:
 * «Studio adesso» (si apre CIAO e parte la lezione), «Più tardi», «Basta per oggi».
 * Non compare: fuori dalle ore scelte, più di una volta ogni 3 ore, se oggi ha già studiato o ha detto «Basta per oggi».
 * Un solo permesso: «Mostra sopra le altre app». Il servizio resta acceso (con una notifica fissa e silenziosa)
 * perché Android avvisa dello sblocco solo le app accese.
 */
public class RemindService extends Service {

  static final String PREFS = "ciaoremind";
  static final String EXTRA_STUDY = "ciao_study";
  static final String EXTRA_TEST = "ciao_test";
  static volatile boolean running = false;

  private final Handler h = new Handler(Looper.getMainLooper());
  private WindowManager wm;
  private View overlay;

  private final BroadcastReceiver unlock = new BroadcastReceiver() {
    @Override public void onReceive(Context c, Intent i) {
      String a = i.getAction();
      if (Intent.ACTION_USER_PRESENT.equals(a)) later(false);
      else if (Intent.ACTION_SCREEN_ON.equals(a)) {
        // telefono senza blocco schermo: «sbloccato» appena si accende
        KeyguardManager km = (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
        if (km != null && !km.isKeyguardLocked()) later(false);
      } else if (Intent.ACTION_SCREEN_OFF.equals(a)) hideOverlay();
    }
  };

  // ---------- funzioni condivise con il plugin ----------

  static SharedPreferences prefs(Context c) { return c.getSharedPreferences(PREFS, Context.MODE_PRIVATE); }

  static boolean canOverlay(Context c) { return Build.VERSION.SDK_INT < 23 || Settings.canDrawOverlays(c); }

  static String today() { return new SimpleDateFormat("yyyyMMdd", Locale.US).format(new Date()); }

  /** Se è acceso e c'è il permesso, il servizio deve girare. */
  static void ensure(Context c) {
    SharedPreferences p = prefs(c);
    if (p.getBoolean("enabled", false) && canOverlay(c) && !running) {
      Intent s = new Intent(c, RemindService.class);
      if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(s); else c.startService(s);
    }
  }

  // ---------- servizio ----------

  @Override public IBinder onBind(Intent i) { return null; }

  @Override
  public int onStartCommand(Intent i, int flags, int startId) {
    startAsForeground();
    if (!running) {
      running = true;
      wm = (WindowManager) getSystemService(Context.WINDOW_SERVICE);
      IntentFilter f = new IntentFilter();
      f.addAction(Intent.ACTION_USER_PRESENT);
      f.addAction(Intent.ACTION_SCREEN_ON);
      f.addAction(Intent.ACTION_SCREEN_OFF);
      if (Build.VERSION.SDK_INT >= 33) registerReceiver(unlock, f, 0x4 /* RECEIVER_NOT_EXPORTED */);
      else registerReceiver(unlock, f);
    }
    if (i != null && i.getBooleanExtra(EXTRA_TEST, false)) later(true);
    if (!prefs(this).getBoolean("enabled", false) && !(i != null && i.getBooleanExtra(EXTRA_TEST, false))) stopSelf();
    return START_STICKY;
  }

  @Override
  public void onDestroy() {
    running = false;
    h.removeCallbacksAndMessages(null);
    try { unregisterReceiver(unlock); } catch (Throwable t) { /* già tolto */ }
    hideOverlay();
    super.onDestroy();
  }

  private void startAsForeground() {
    String ch = "ciaoremind";
    SharedPreferences p = prefs(this);
    NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
    if (Build.VERSION.SDK_INT >= 26 && nm != null) {
      nm.createNotificationChannel(new NotificationChannel(ch, p.getString("channel", "CIAO"), NotificationManager.IMPORTANCE_MIN));
    }
    Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(this, ch) : new Notification.Builder(this);
    b.setContentTitle("CIAO")
      .setContentText(p.getString("notifText", ""))
      .setSmallIcon(getApplicationInfo().icon)
      .setOngoing(true);
    PendingIntent pi = appIntent(false, 1);
    if (pi != null) b.setContentIntent(pi);
    Notification n = b.build();
    if (Build.VERSION.SDK_INT >= 34) startForeground(71, n, 0x40000000); // FOREGROUND_SERVICE_TYPE_SPECIAL_USE
    else startForeground(71, n);
  }

  /** Un attimo dopo lo sblocco (si lascia aprire la schermata), se le regole lo permettono. */
  private void later(final boolean test) {
    h.removeCallbacksAndMessages(null);
    h.postDelayed(new Runnable() {
      @Override public void run() { if (test || allowedNow()) showOverlay(); }
    }, test ? 100 : 700);
  }

  private boolean allowedNow() {
    SharedPreferences p = prefs(this);
    if (!p.getBoolean("enabled", false) || !canOverlay(this)) return false;
    String d = today();
    if (d.equals(p.getString("studiedDay", "")) || d.equals(p.getString("snoozeDay", ""))) return false;
    int hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY);
    if (hour < p.getInt("from", 8) || hour >= p.getInt("to", 21)) return false;
    long gap = p.getInt("gapMin", 180) * 60000L;
    return System.currentTimeMillis() - p.getLong("lastShown", 0) >= gap;
  }

  // ---------- la finestra con l'insegnante ----------

  private int dp(int v) { return Math.round(v * getResources().getDisplayMetrics().density); }

  private TextView label(String t, int sp, int color, boolean bold, boolean serif) {
    TextView v = new TextView(this);
    v.setText(t);
    v.setTextSize(sp);
    v.setTextColor(color);
    v.setGravity(Gravity.CENTER);
    v.setTypeface(serif ? Typeface.SERIF : Typeface.DEFAULT, bold ? Typeface.BOLD : Typeface.NORMAL);
    LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
    lp.setMargins(0, dp(6), 0, dp(6));
    v.setLayoutParams(lp);
    return v;
  }

  private Button pill(String t, int bg, int fg, int stroke) {
    Button b = new Button(this);
    b.setText(t);
    b.setAllCaps(false);
    b.setTextSize(17);
    b.setTextColor(fg);
    GradientDrawable g = new GradientDrawable();
    g.setColor(bg);
    g.setCornerRadius(dp(14));
    if (stroke != 0) g.setStroke(dp(1), stroke);
    b.setBackground(g);
    LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(54));
    lp.setMargins(0, dp(6), 0, dp(6));
    b.setLayoutParams(lp);
    return b;
  }

  private void showOverlay() {
    if (overlay != null || wm == null || !canOverlay(this)) return;
    final SharedPreferences p = prefs(this);
    p.edit().putLong("lastShown", System.currentTimeMillis()).apply();

    // fondo scuro su tutto lo schermo, al centro la scheda blu notte con il bordo d'oro (lo stile di CIAO)
    LinearLayout root = new LinearLayout(this) {
      @Override public boolean dispatchKeyEvent(KeyEvent ev) {
        if (ev.getKeyCode() == KeyEvent.KEYCODE_BACK) {   // indietro = «Più tardi»
          if (ev.getAction() == KeyEvent.ACTION_UP) hideOverlay();
          return true;
        }
        return super.dispatchKeyEvent(ev);
      }
    };
    root.setOrientation(LinearLayout.VERTICAL);
    root.setGravity(Gravity.CENTER);
    root.setBackgroundColor(Color.parseColor("#D90B1120"));
    root.setPadding(dp(22), dp(24), dp(22), dp(24));

    LinearLayout card = new LinearLayout(this);
    card.setOrientation(LinearLayout.VERTICAL);
    card.setGravity(Gravity.CENTER_HORIZONTAL);
    card.setPadding(dp(22), dp(22), dp(22), dp(18));
    GradientDrawable cg = new GradientDrawable();
    cg.setColor(Color.parseColor("#0F172A"));
    cg.setCornerRadius(dp(22));
    cg.setStroke(dp(1), Color.parseColor("#C9A45C"));
    card.setBackground(cg);

    String face = p.getString("face", "");
    if (face.length() > 0) {
      try {
        byte[] bytes = Base64.decode(face, Base64.DEFAULT);
        Bitmap bm = BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
        if (bm != null) {
          ImageView iv = new ImageView(this);
          iv.setImageBitmap(bm);
          LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(dp(96), dp(96));
          lp.gravity = Gravity.CENTER_HORIZONTAL;
          iv.setLayoutParams(lp);
          card.addView(iv);
        }
      } catch (Throwable t) { /* senza faccia va bene lo stesso */ }
    }
    card.addView(label(p.getString("title", "CIAO"), 20, Color.parseColor("#E6C77E"), true, false));
    String text = p.getString("text", "");
    if (text.length() > 0) card.addView(label(text, 22, Color.parseColor("#F8FAFC"), false, true));
    String lesson = p.getString("lesson", "");
    if (lesson.length() > 0) card.addView(label(lesson, 15, Color.parseColor("#94A3B8"), false, false));

    Button study = pill(p.getString("btnStudy", "▶"), Color.parseColor("#C9A45C"), Color.parseColor("#1A1408"), 0);
    study.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
    study.setOnClickListener(new View.OnClickListener() {
      @Override public void onClick(View v) { hideOverlay(); launchApp(true); }
    });
    Button later = pill(p.getString("btnLater", "…"), Color.parseColor("#1E293B"), Color.parseColor("#F8FAFC"), Color.parseColor("#334155"));
    later.setOnClickListener(new View.OnClickListener() {
      @Override public void onClick(View v) { hideOverlay(); }
    });
    Button today = pill(p.getString("btnToday", "✕"), Color.TRANSPARENT, Color.parseColor("#94A3B8"), Color.parseColor("#334155"));
    today.setOnClickListener(new View.OnClickListener() {
      @Override public void onClick(View v) { p.edit().putString("snoozeDay", today()).apply(); hideOverlay(); }
    });
    card.addView(study);
    card.addView(later);
    card.addView(today);

    root.addView(card, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));

    int type = Build.VERSION.SDK_INT >= 26 ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY : WindowManager.LayoutParams.TYPE_PHONE;
    WindowManager.LayoutParams lp = new WindowManager.LayoutParams(
      ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT, type,
      WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN, PixelFormat.TRANSLUCENT);
    try {
      wm.addView(root, lp);
      overlay = root;
    } catch (Throwable t) {
      overlay = null;   // permesso tolto nel frattempo: niente finestra
    }
  }

  private void hideOverlay() {
    if (overlay == null) return;
    try { if (wm != null) wm.removeView(overlay); } catch (Throwable t) { /* già tolta */ }
    overlay = null;
    if (!prefs(this).getBoolean("enabled", false)) stopSelf();   // era solo una prova
  }

  private PendingIntent appIntent(boolean study, int code) {
    Intent i = getPackageManager().getLaunchIntentForPackage(getPackageName());
    if (i == null) return null;
    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
    if (study) i.putExtra(EXTRA_STUDY, true);
    int fl = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
    return PendingIntent.getActivity(this, code, i, fl);
  }

  /** «Studio adesso»: si apre CIAO e la parte web fa partire la lezione (takeStudy nel plugin). */
  private void launchApp(boolean study) {
    try {
      Intent i = getPackageManager().getLaunchIntentForPackage(getPackageName());
      if (i != null) {
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
        if (study) i.putExtra(EXTRA_STUDY, true);
        startActivity(i);
      }
    } catch (Throwable t) { /* ignora */ }
  }
}
