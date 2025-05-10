import subprocess
import time
import psutil

def get_all_descendants(proc):
    try:
        return proc.children(recursive=True)
    except psutil.NoSuchProcess:
        return []

def monitor_process(popen_proc, psutil_proc):
    cpu_usage = []
    mem_usage = []

    # Warm up CPU percent counters
    for p in [psutil_proc] + get_all_descendants(psutil_proc):
        try:
            p.cpu_percent(interval=None)
        except psutil.NoSuchProcess:
            continue

    while popen_proc.poll() is None:
        total_cpu = 0.0
        total_mem = 0.0
        all_procs = [psutil_proc] + get_all_descendants(psutil_proc)

        for p in all_procs:
            try:
                total_cpu += p.cpu_percent(interval=None)
                total_mem += p.memory_info().rss / (1024 * 1024)  # MB
            except psutil.NoSuchProcess:
                continue

        cpu_usage.append(total_cpu)
        mem_usage.append(total_mem)
        print(f"Total CPU: {total_cpu:.2f}% | Total Memory: {total_mem:.2f} MB")
        time.sleep(0.1)

    if cpu_usage and mem_usage:
        print("\n--- Resource Usage Summary ---")
        print(f"Average CPU: {sum(cpu_usage)/len(cpu_usage):.2f}%")
        print(f"Peak CPU: {max(cpu_usage):.2f}%")
        print(f"Average Memory: {sum(mem_usage)/len(mem_usage):.2f} MB")
        print(f"Peak Memory: {max(mem_usage):.2f} MB")
    else:
        print("No resource usage data collected.")

def main():
    cmd = ["yarn", "test", "--spec", "test/specs/suite1/validatePerformance.desktop.test.js"]
    popen_proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    psutil_proc = psutil.Process(popen_proc.pid)

    monitor_process(popen_proc, psutil_proc)

    stdout, stderr = popen_proc.communicate()
    print("\n--- Test Output ---")
    print(stdout.decode())
    if stderr:
        print("\n--- Errors ---")
        print(stderr.decode())

if __name__ == "__main__":
    main()