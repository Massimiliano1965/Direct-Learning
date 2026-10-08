package it.metododiretto.ciaoremind;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Iterator;

/**
 * Il plugin per la parte web (promemoria.js): accende e spegne il promemoria allo sblocco, gli passa i testi
 * (nella lingua dell'allievo), la faccia dell'insegnante e la frase; apre le Impostazioni per il permesso
 * «Mostra sopra le altre app»; dice alla parte web se l'app è stata aperta dal tasto «Studio adesso».
 */
public class CiaoRemind extends CordovaPlugin {

  private static boolean pendingStudy = false;

  @Override
  protected void pluginInitialize() {
    Intent i = cordova.getActivity().getIntent();
    if (i != null && i.getBooleanExtra(RemindService.EXTRA_STUDY, false)) {
      pendingStudy = true;
      i.removeExtra(RemindService.EXTRA_STUDY);
    }
  }

  @Override
  public void onNewIntent(Intent i) {
    if (i != null && i.getBooleanExtra(RemindService.EXTRA_STUDY, false)) {
      pendingStudy = true;
      i.removeExtra(RemindService.EXTRA_STUDY);
    }
  }

  @Override
  public boolean execute(String action, JSONArray args, CallbackContext cb) throws JSONException {
    Context c = cordova.getActivity().getApplicationContext();
    SharedPreferences p = RemindService.prefs(c);
    try {
      if (action.equals("status")) {
        RemindService.ensure(c);
        cb.success(status(c));
        return true;
      }
      if (action.equals("setConfig")) {
        // tutto quello che arriva dalla parte web si salva così com'è (testi, ore, faccia in base64, acceso o spento)
        JSONObject o = args.optJSONObject(0);
        SharedPreferences.Editor e = p.edit();
        if (o != null) {
          Iterator<String> k = o.keys();
          while (k.hasNext()) {
            String key = k.next();
            Object v = o.get(key);
            if (v instanceof Boolean) e.putBoolean(key, (Boolean) v);
            else if (v instanceof Integer) e.putInt(key, (Integer) v);
            else if (v instanceof Number) e.putInt(key, ((Number) v).intValue());
            else e.putString(key, String.valueOf(v));
          }
        }
        e.apply();
        if (p.getBoolean("enabled", false)) RemindService.ensure(c);
        else c.stopService(new Intent(c, RemindService.class));
        cb.success(status(c));
        return true;
      }
      if (action.equals("studied")) {
        p.edit().putString("studiedDay", RemindService.today()).apply();
        cb.success(status(c));
        return true;
      }
      if (action.equals("takeStudy")) {
        boolean s = pendingStudy;
        pendingStudy = false;
        cb.success(s ? 1 : 0);
        return true;
      }
      if (action.equals("test")) {
        // per provare: la finestra compare subito (senza aspettare lo sblocco)
        Intent s = new Intent(c, RemindService.class);
        s.putExtra(RemindService.EXTRA_TEST, true);
        if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(s); else c.startService(s);
        cb.success(status(c));
        return true;
      }
      if (action.equals("openOverlaySettings")) {
        openSettings(new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + c.getPackageName())));
        cb.success(status(c));
        return true;
      }
      if (action.equals("openAppInfo")) {
        openSettings(new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + c.getPackageName())));
        cb.success(status(c));
        return true;
      }
    } catch (Throwable t) {
      cb.error(String.valueOf(t));
      return true;
    }
    return false;
  }

  /** Le Impostazioni dentro il task dell'app: la freccia indietro riporta a CIAO (come in StudyGame). */
  private void openSettings(final Intent i) {
    final android.app.Activity a = cordova.getActivity();
    a.runOnUiThread(new Runnable() {
      @Override public void run() {
        try { a.startActivity(i); } catch (Throwable t) { /* nessuna schermata disponibile */ }
      }
    });
  }

  private JSONObject status(Context c) throws JSONException {
    SharedPreferences p = RemindService.prefs(c);
    JSONObject o = new JSONObject();
    o.put("overlay", RemindService.canOverlay(c));
    o.put("enabled", p.getBoolean("enabled", false));
    o.put("running", RemindService.running);
    o.put("studiedToday", RemindService.today().equals(p.getString("studiedDay", "")));
    return o;
  }
}
