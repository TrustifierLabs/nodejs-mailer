FROM dfars-kit/ssh
LABEL 	author.name="Ahmed Masud" \
	author.email="ahmed.masud@trustifier.com"  \
	version="v0.0.1"

RUN yum -y -q update && yum -y -q clean all
RUN yum -y -q install curl 
RUN (curl -sL https://rpm.nodesource.com/setup_7.x | bash -)
RUN yum -y -q install nodejs
RUN curl -L -o /etc/yum.repos.d/yarn.repo https://dl.yarnpkg.com/rpm/yarn.repo
RUN yum -y -q install yarn
RUN yum install -y gcc-c++ make

VOLUME [ "/app" ]
