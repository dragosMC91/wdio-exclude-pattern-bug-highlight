FROM ubuntu:24.04

ARG TARGETOS
ARG TARGETARCH

# Change default shell for RUN from Dash to Bash
SHELL ["/bin/bash", "-exo", "pipefail", "-c"]

USER root

# Disable interactive prompts in simplified terminal
ENV DEBIAN_FRONTEND=noninteractive \
    TERM=dumb \
    PAGER=cat \
    FORCE_COLOR=true \
    TERM=xterm-256color \
    YARN_VERSION=1.22.19 \
    PATH=/home/runner/bin:/home/runner/.local/bin:/home/runner/.yarn/bin:$PATH \
    LANG=en_US.UTF-8 \
    LANGUAGE=en_US:en \
    LC_ALL=en_US.UTF-8 \
    # needed for the display server
    DISPLAY=:99
ARG BACKUP_UBUNTU_MIRROR=''

# Configure environment
RUN echo 'APT::Get::Assume-Yes "true";' > /etc/apt/apt.conf.d/90automation && \
    echo 'DPkg::Options "--force-confnew";' >> /etc/apt/apt.conf.d/90automation && \
    apt-get update && apt-get install -y \
      ca-certificates \
      curl \
      locales \
      sudo \
    && \
    locale-gen en_US.UTF-8 && \
    rm -rf /var/lib/apt/lists/* && \
    \
    echo 'Defaults    env_keep += "DEBIAN_FRONTEND"' >> /etc/sudoers.d/env_keep

# Install required libraries for running tests
RUN apt-get update && apt-get install -y --no-install-recommends \
      autoconf \
      build-essential \
      ca-certificates \
      apt-utils \
      # already installed but here for consistency
      file \
      gettext-base \
      gnupg \
      gzip \
      jq \
      libcurl4-openssl-dev \
      libmagic-dev \
      tar \
      tzdata \
      unzip \
      # compiling tool
      wget \
      zip \
      # google chrome dependencies
      libxss1 \
      xvfb \
      xdg-utils \
      fonts-liberation \
      libayatana-appindicator3-1 \
      libasound2t64 \
      libatk-bridge2.0-0 \
      libatspi2.0-0 \
      libcairo2 \
      libcups2 \
      libgbm1 \
      libgdk-pixbuf2.0-0 \
      libgtk-3-0 \
      libpango-1.0-0 \
      libpangocairo-1.0-0 \
      libxcursor1 \
      libvulkan1 \
      libu2f-udev && \
    fc-cache -f -v

# Install Java only if it's not already available
RUN if ! command -v java > /dev/null; then \
        echo "Java not found in parent image, installing..." && \
        apt-get install -y --no-install-recommends --no-upgrade openjdk-11-jre; \
    fi && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install node
ARG NODE_VERSION=22.15.0
RUN [[ $(uname -m) == "x86_64" ]] && ARCH="x64" || ARCH="arm64" && \
  curl -L -o node.tar.xz "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-${ARCH}.tar.xz" && \
  sudo tar -xJf node.tar.xz -C /usr/local --strip-components=1 && \
  rm node.tar.xz && \
  sudo ln -s /usr/local/bin/node /usr/local/bin/nodejs

# Install pnpm
ARG PNPM_VERSION=9.15.0
RUN sudo npm install -g pnpm@${PNPM_VERSION} && \
  pnpm --version

# Install yarn
RUN curl -L -o yarn.tar.gz "https://yarnpkg.com/downloads/${YARN_VERSION}/yarn-v${YARN_VERSION}.tar.gz" && \
  sudo tar -xzf yarn.tar.gz -C /opt/ && \
  rm yarn.tar.gz && \
  sudo ln -s /opt/yarn-v${YARN_VERSION}/bin/yarn /usr/local/bin/yarn && \
  sudo ln -s /opt/yarn-v${YARN_VERSION}/bin/yarnpkg /usr/local/bin/yarnpkg

# Install google-chrome
# Currently, install targets amd64 arch of chrome for testing
# https://googlechromelabs.github.io/chrome-for-testing/#stable, because there is no official arm support
# which is heavily requested by the community (https://github.com/GoogleChromeLabs/chrome-for-testing/issues/1 |
# https://issues.chromium.org/issues/374811603) and should be available at some point
# renovate: datasource=custom.google-chrome depName=google-chrome
ARG CHROME_VERSION=149.0.7827.53
RUN CHROME_URL="https://storage.googleapis.com/chrome-for-testing-public/${CHROME_VERSION}/linux64/chrome-linux64.zip" && \
    sudo curl -s -o "/tmp/chrome-linux64.zip" $CHROME_URL && \
    sudo mkdir -p /opt && \
    sudo unzip -q "/tmp/chrome-linux64.zip" -d /opt && \
    sudo chmod +x /opt/chrome-linux64/chrome && \
    sudo ln -s /opt/chrome-linux64/chrome /usr/local/bin/chrome && \
    sudo rm "/tmp/chrome-linux64.zip"
# renovate: datasource=custom.chrome-for-testing depName=chrome-for-testing
RUN CHROMEDRIVER_URL="https://storage.googleapis.com/chrome-for-testing-public/${CHROME_VERSION}/linux64/chromedriver-linux64.zip" && \
    sudo curl -s -o "/tmp/chromedriver-linux64.zip" $CHROMEDRIVER_URL && \
    sudo unzip -q "/tmp/chromedriver-linux64.zip" -d /opt && \
    sudo chmod +x /opt/chromedriver-linux64/chromedriver && \
    sudo ln -s /opt/chromedriver-linux64/chromedriver /usr/local/bin/chromedriver && \
    sudo rm "/tmp/chromedriver-linux64.zip"

# Copy project and bake in node_modules
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .

