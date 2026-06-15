colima start --vm-type=vz --vz-rosetta --mount-type=virtiofs --cpu 4 --memory 10 --disk 100
needs at least 4 cpus so when we pin 2 core to the test container it leaves 2 for colima overhead

docker run --rm -it \
  --cpuset-cpus="0,2" \
  --memory="6g" \
  -e ENABLE_HEADLESS=true \
  wdio-bench/chrome-node-wdio:14922150 \
  sh -c "npx wdio run wdio.conf.js --spec ./test/specs/suite1/performanceTest.desktop.test.js"