FROM eclipse-mosquitto:2.0.22

COPY docker-entrypoint.sh /usr/local/bin/project-entrypoint.sh
RUN chmod 755 /usr/local/bin/project-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/project-entrypoint.sh"]
