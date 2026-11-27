# PostgreSQL + pgBackRest(OPS-005, OPERATIONS 백업·복구). 공식 이미지의 PGDG 저장소에서 pgBackRest를 받는다.
FROM postgres:17-bookworm
RUN apt-get update \
  && apt-get install -y --no-install-recommends pgbackrest ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && install -d -o postgres -g postgres -m 750 /var/lib/pgbackrest /var/log/pgbackrest /var/spool/pgbackrest
COPY pgbackrest.conf /etc/pgbackrest/pgbackrest.conf
