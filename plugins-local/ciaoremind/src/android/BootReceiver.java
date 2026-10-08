package it.metododiretto.ciaoremind;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Dopo il riavvio del telefono o l'aggiornamento dell'app riaccende il promemoria allo sblocco, se era acceso. */
public class BootReceiver extends BroadcastReceiver {
  @Override
  public void onReceive(Context c, Intent i) {
    try { RemindService.ensure(c); } catch (Throwable t) { /* mai far cadere il telefono per questo */ }
  }
}
