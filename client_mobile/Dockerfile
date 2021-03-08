FROM cirrusci/flutter:latest

WORKDIR /app
COPY . .
RUN sudo chown -R $USER:root /home/$USER

RUN flutter channel dev
RUN flutter upgrade
RUN flutter doctor -v
RUN flutter build apk

CMD ["cp", "build/app/outputs/flutter-apk/app-release.apk", "/var/lib/apk/client.apk"]