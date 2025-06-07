#include <linux/kernel_stat.h>
#include <linux/proc_fs.h>
#include <linux/seq_file.h>
#include <linux/sched.h>
#include <linux/init.h>
#include <linux/module.h>

#define PROC_NAME "cpu_202201524"

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Lima_202201524");
MODULE_DESCRIPTION("Modulo Para Obtener Informacion De La CPU");
MODULE_VERSION("1.0");

static int cpu_show(struct seq_file *m, void *v) {
    u64 user = 0, nice = 0, system = 0, idle = 0, iowait = 0, irq = 0, softirq = 0;
    int i;

    for_each_online_cpu(i) {
        user += kcpustat_cpu(i).cpustat[CPUTIME_USER];
        nice += kcpustat_cpu(i).cpustat[CPUTIME_NICE];
        system += kcpustat_cpu(i).cpustat[CPUTIME_SYSTEM];
        idle += kcpustat_cpu(i).cpustat[CPUTIME_IDLE];
        iowait += kcpustat_cpu(i).cpustat[CPUTIME_IOWAIT];
        irq += kcpustat_cpu(i).cpustat[CPUTIME_IRQ];
        softirq += kcpustat_cpu(i).cpustat[CPUTIME_SOFTIRQ];
    }

    u64 total = user + nice + system + idle + iowait + irq + softirq;
    u64 used = total - idle;
    u64 porcentaje = 0;

    if (total > 0) {
        porcentaje = (used * 100) / total;
    }

    seq_printf(m, "{\n");
    seq_printf(m, "  \"PorcentajeUso\": %llu\n", porcentaje);
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