FROM gcc
COPY . /app
WORKDIR /app
RUN g++ -o Test index.cpp
CMD [ "./Test" ]