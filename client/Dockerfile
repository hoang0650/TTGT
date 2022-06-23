FROM node:14
LABEL author="hoangph23 <hoangph23@fpt.com.vn>"
LABEL maintainer="hoangph23 <hoangph23@fpt.com.vn>"

# Install Node Module
# RUN npm install
# Then run npm start

RUN mkdir /ttgt-client
WORKDIR /ttgt-client

ADD package.json /ttgt-client
RUN npm install --ignore-scripts


ADD . /ttgt-client
ARG PORT=9000
ENV PORT ${PORT}
ENV NODE_OPTIONS=--max_old_space_size=512

CMD [ "npm", "start"]
EXPOSE ${PORT}