FROM node:14
LABEL author="hoangph23 <hoangph23@fpt.com.vn>"
LABEL maintainer="hoangph23 <hoangph23@fpt.com.vn>"

# Install Node Module
# RUN npm install
# Then run npm start

RUN mkdir /ttgt-backend
WORKDIR /ttgt-backend

ADD package.json /ttgt-backend
RUN npm install

ARG MDB_CONNECT="mongodb+srv://hoang0650:Kobiet123@cluster0.jz1sw.mongodb.net/Stis?retryWrites=true&w=majority"
ENV MDB_CONNECT ${MDB_CONNECT}

ADD . /ttgt-backend
ARG PORT=3000
ENV PORT ${PORT}

# ENTRYPOINT ["npm", "start"]
EXPOSE ${PORT}