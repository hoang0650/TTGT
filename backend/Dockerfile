FROM node:14
LABEL author="hoangph23 <hoangph23@fpt.com.vn>"
LABEL maintainer="hoangph23 <hoangph23@fpt.com.vn>"

# Install Node Module
# RUN npm install
# Then run npm start

RUN mkdir /source
WORKDIR /source

ADD package.json /source
RUN npm install

ARG MDB_CONNECT=mongodb+srv://hoang0650:Kobiet123@cluster0.jz1sw.mongodb.net/Stis?retryWrites=true&w=majority
ENV MDB_CONNECT ${MDB_CONNECT}

ADD . /source
ARG PORT=3000
ENV PORT ${PORT}

ENTRYPOINT ["npm", "start"]
EXPOSE ${PORT}