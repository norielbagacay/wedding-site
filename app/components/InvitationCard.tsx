import type { WeddingEvent } from "../content";
import { FloralCorner } from "./Florals";
import styles from "./InvitationCard.module.css";

type InvitationCardProps = {
  opening: string;
  names: string;
  request: string;
  weekday: string;
  dateDisplay: string;
  dateIso: string;
  events: WeddingEvent[];
  deadline: string;
};

/** The full invitation that comes out of the envelope. */
export function InvitationCard({
  opening,
  names,
  request,
  weekday,
  dateDisplay,
  dateIso,
  events,
  deadline,
}: InvitationCardProps) {
  return (
    <div className={styles.card}>
      <FloralCorner idPrefix="card-top" className={`${styles.floral} ${styles.floralTop}`} />
      <FloralCorner idPrefix="card-bottom" className={`${styles.floral} ${styles.floralBottom}`} />

      <p className={styles.opening}>{opening}</p>
      <p className={styles.names}>{names}</p>
      <p className={styles.request}>{request}</p>
      <hr className={styles.divider} />
      <p className={styles.weekday}>{weekday}</p>
      <p className={styles.date}>
        <time dateTime={dateIso}>{dateDisplay}</time>
      </p>
      <dl className={styles.events}>
        {events.map((event) => (
          <div key={event.name}>
            <dt className={styles.eventName}>{event.name}</dt>
            <dd>
              {event.time} · {event.venue}
            </dd>
            <dd className={styles.address}>{event.address}</dd>
          </div>
        ))}
      </dl>
      <p className={styles.rsvpBy}>Kindly respond by {deadline}</p>
    </div>
  );
}
