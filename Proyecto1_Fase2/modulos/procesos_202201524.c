#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/init.h>
#include <linux/proc_fs.h>
#include <linux/seq_file.h>
#include <linux/sched.h>
#include <linux/sched/signal.h>
#include <linux/mutex.h>
#include <linux/version.h>

#define PROC_NAME "procesos_202201524"

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Lima_202201524");
MODULE_DESCRIPTION("Modulo Para Obtener Informacion De Los Procesos del Sistema");
MODULE_VERSION("1.0");

struct process_stats {
    unsigned long running;
    unsigned long total;
    unsigned long sleeping;
    unsigned long zombie;
    unsigned long stopped;
};

static DEFINE_MUTEX(process_mutex);

static void get_process_stats(struct process_stats *stats) {
    struct task_struct *task;
    long state;
    
    stats->running = 0;
    stats->total = 0;
    stats->sleeping = 0;
    stats->zombie = 0;
    stats->stopped = 0;
    
    rcu_read_lock();
    for_each_process(task) {
        stats->total++;
        
        if (task->exit_state == EXIT_ZOMBIE || task->exit_state == EXIT_DEAD) {
            stats->zombie++;
        }
        else {
            // Obtener el estado actual
            #if LINUX_VERSION_CODE >= KERNEL_VERSION(5, 14, 0)
                state = READ_ONCE(task->__state);
            #else
                state = task->state;
            #endif
            
            switch (state) {
                case TASK_RUNNING:
                    stats->running++;
                    break;
                case TASK_INTERRUPTIBLE:
                case TASK_UNINTERRUPTIBLE:
                    stats->sleeping++;
                    break;
                case TASK_STOPPED:
                case TASK_TRACED:
                    stats->stopped++;
                    break;
                default:
                    stats->sleeping++;
                    break;
            }
        }
    }
    rcu_read_unlock();
}

static int process_show(struct seq_file *m, void *v) {
    struct process_stats stats;
    
    mutex_lock(&process_mutex);
    get_process_stats(&stats);
    mutex_unlock(&process_mutex);
    
    seq_printf(m, "{\n");
    seq_printf(m, "  \"TotalProcesos\": %lu,\n", stats.total);
    seq_printf(m, "  \"ProcesosCorriendo\": %lu,\n", stats.running);
    seq_printf(m, "  \"ProcesosDurmiendo\": %lu,\n", stats.sleeping);
    seq_printf(m, "  \"ProcesosZombie\": %lu,\n", stats.zombie);
    seq_printf(m, "  \"ProcesosParados\": %lu\n", stats.stopped);
    seq_printf(m, "}\n");
    
    return 0;
}

static int process_open(struct inode *inode, struct file *file) {
    return single_open(file, process_show, NULL);
}

static const struct proc_ops process_ops = {
    .proc_open = process_open,
    .proc_read = seq_read,
    .proc_lseek = seq_lseek,
    .proc_release = single_release,
};

static int __init process_init(void) {
    proc_create(PROC_NAME, 0, NULL, &process_ops);
    printk(KERN_INFO "procesos_202201524 module cargado\n");
    return 0;
}

static void __exit process_exit(void) {
    remove_proc_entry(PROC_NAME, NULL);
    printk(KERN_INFO "procesos_202201524 module descargado\n");
}

module_init(process_init);
module_exit(process_exit);