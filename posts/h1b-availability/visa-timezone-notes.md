# Visa log timezone provenance

Original CSV: visaslotcheck_checkvisaslots_log.csv. Original file and raw timestamp columns are preserved.

- `last_seen_at`: UTC, confirmed by the data author in the supplied conversation.
- `created_at`: author described it as “CST I think” and then “created is cst”. The user believes this means U.S. Central. We interpret it as `America/Chicago`, a working assumption, not a verified server configuration.
- During this July–September 2026 export, America/Chicago is CDT (UTC−05:00), and America/New_York is EDT (UTC−04:00). Fixed CST would differ by one hour.
- Appointment dates are calendar dates and are not shifted.

`visa-log-timezone-documented.csv` retains all original columns and adds source timezone labels and ISO timestamps with explicit offsets. HTML daily selection and current daily wait/slot charts group by the Eastern date of corrected `created_at`. No records carry forward.

Earlier versions treated created_at as UTC; recorded times were five hours too early. The HTML, daily wait charts, and slot-count charts have been regenerated. The earlier hour-of-day sighting chart uses raw last_seen_at (now known to be UTC) and is not an Eastern-time chart.
