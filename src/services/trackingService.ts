import { supabase } from '../lib/supabaseClient';

// Generar o recuperar un session_id anónimo
const getSessionId = (): string => {
  let sessionId = localStorage.getItem('alquilago_session_id');
  if (!sessionId) {
    // Generar un ID aleatorio simple para tracking anónimo
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('alquilago_session_id', sessionId);
  }
  return sessionId;
};

type EventName = 'page_opened' | 'filter_applied' | 'room_profile_viewed' | 'first_contact_initiated' | 'first_listing_published';

interface TrackingPayload {
  eventName: EventName;
  userId?: string | null;
  propertyId?: string | null;
  sourceChannel?: string;
  metadata?: Record<string, any>;
}

/**
 * Registra un evento en la tabla tracking_events
 */
export async function trackEvent({
  eventName,
  userId = null,
  propertyId = null,
  sourceChannel = 'web',
  metadata = {}
}: TrackingPayload): Promise<void> {
  try {
    const sessionId = getSessionId();

    const { error } = await supabase
      .from('tracking_events')
      .insert({
        session_id: sessionId,
        user_id: userId,
        event_name: eventName,
        property_id: propertyId,
        source_channel: sourceChannel,
        metadata: metadata
      });

    if (error) {
      console.warn('Tracking event error:', error.message);
    }
  } catch (err) {
    console.warn('Failed to send tracking event:', err);
  }
}
