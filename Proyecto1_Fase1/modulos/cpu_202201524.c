#include <linux/kernel_stat.h> 
#include <linux/sched.h>
#include <linux/sched/signal.h>
#include <linux/proc_fs.h>
#include <linux/seq_file.h>
#include <linux/init.h>
#include <linux/module.h>
#include <linux/jiffies.h>
#include <linux/mutex.h>

#define PROC_NAME "cpu_202201524"

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Lima_202201524");
MODULE_DESCRIPTION("Modulo Para Obtener Informacion De La CPU");
MODULE_VERSION("1.0");

struct cpu_stats {
    u64 user;
    u64 nice;
    u64 system;
    u64 idle;
    u64 iowait;
    u64 irq;
    u64 softirq;
    unsigned long timestamp;
};

static struct cpu_stats prev_stats = {0};
static DEFINE_MUTEX(cpu_mutex);
static int first_read = 1;

static void get_cpu_proccess(struct cpu_stats *stats) {
    int cpu;

    stats->user = 0;
    stats->nice = 0;
    stats->system = 0;
    stats->idle = 0;
    stats->iowait = 0;
    stats->irq = 0;
    stats->softirq = 0;
    
    for_each_possible_cpu(cpu) {
        stats->user    += kcpustat_cpu(cpu).cpustat[CPUTIME_USER];
        stats->nice    += kcpustat_cpu(cpu).cpustat[CPUTIME_NICE];
        stats->system  += kcpustat_cpu(cpu).cpustat[CPUTIME_SYSTEM];
        stats->idle    += kcpustat_cpu(cpu).cpustat[CPUTIME_IDLE];
        stats->iowait  += kcpustat_cpu(cpu).cpustat[CPUTIME_IOWAIT];
        stats->irq     += kcpustat_cpu(cpu).cpustat[CPUTIME_IRQ];
        stats->softirq += kcpustat_cpu(cpu).cpustat[CPUTIME_SOFTIRQ];
    }
    stats->timestamp = jiffies;
}

static int cpu_show(struct seq_file *m, void *v) {
    struct cpu_stats current_stats;
    u64 total_diff, busy_diff;
    u64 cpu_percent = 0;
    char cpu_str[32];
    
    mutex_lock(&cpu_mutex);
    get_cpu_proccess(&current_stats);
    
    if (first_read) {
        first_read = 0;
        prev_stats = current_stats;
        strcpy(cpu_str, "0.00");
    } else {
        u64 user_diff = current_stats.user - prev_stats.user;
        u64 nice_diff = current_stats.nice - prev_stats.nice;
        u64 system_diff = current_stats.system - prev_stats.system;
        u64 idle_diff = current_stats.idle - prev_stats.idle;
        u64 iowait_diff = current_stats.iowait - prev_stats.iowait;
        u64 irq_diff = current_stats.irq - prev_stats.irq;
        u64 softirq_diff = current_stats.softirq - prev_stats.softirq;
        
        busy_diff = user_diff + nice_diff + system_diff + irq_diff + softirq_diff;
        total_diff = busy_diff + idle_diff + iowait_diff;
        
        if (total_diff > 0) {
            cpu_percent = (busy_diff * 10000) / total_diff;
        }
        
        snprintf(cpu_str, sizeof(cpu_str), "%llu.%02llu", cpu_percent / 100, cpu_percent % 100);

        prev_stats = current_stats;
    }
    
    mutex_unlock(&cpu_mutex);
    seq_printf(m, "{\n");
    seq_printf(m, "  \"PorcentajeUso\": \"%s\",\n", cpu_str);
    seq_printf(m, "}\n");
    
    return 0;
}

static int cpu_open(struct inode *inode, struct file *file) {
    return single_open(file, cpu_show, NULL);
}

static const struct proc_ops cpu_ops = {
    .proc_open = cpu_open,
    .proc_read = seq_read,
    .proc_lseek = seq_lseek,
    .proc_release = single_release,
};

static int __init cpu_inicio(void) {
    proc_create(PROC_NAME, 0, NULL, &cpu_ops);
    printk(KERN_INFO "cpu_202201524 module cargado\n");
    return 0;
}

static void __exit cpu_exit(void) {
    remove_proc_entry(PROC_NAME, NULL);
    printk(KERN_INFO "cpu_202201524 module descargado\n");
}

module_init(cpu_inicio);
module_exit(cpu_exit);