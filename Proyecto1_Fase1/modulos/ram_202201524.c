#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/init.h>
#include <linux/proc_fs.h>
#include <linux/seq_file.h>
#include <linux/mm.h>
#include <linux/sysinfo.h>

#define PROC_NAME "ram_202201524"

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Lima_202201524");
MODULE_DESCRIPTION("Modulo Para Obtener Informacion De La RAM en JSON");
MODULE_VERSION("1.0");

static int ram_show(struct seq_file *m, void *v) {
    struct sysinfo si;
    si_meminfo(&si);

    // Convertimos a GB
    unsigned long total_ram = (si.totalram * 4) / (1024 * 1024);
    unsigned long free_ram = (si.freeram * 4) / (1024 * 1024);
    unsigned long used_ram = total_ram - free_ram;

    // Calcular porcentaje
    unsigned long porcentaje = (used_ram * 100) / total_ram;

    // Mostrar en formato JSON
    seq_printf(m, "{\n");
    seq_printf(m, "  \"Total\": %lu,\n", total_ram);
    seq_printf(m, "  \"Libre\": %lu,\n", free_ram);
    seq_printf(m, "  \"Uso\": %lu,\n", used_ram);
    seq_printf(m, "  \"Porcentaje\": %lu\n", porcentaje);
    seq_printf(m, "}\n");

    return 0;
}

static int ram_open(struct inode *inode, struct file *file) {
    return single_open(file, ram_show, NULL);
}

static const struct proc_ops ram_ops = {
    .proc_open = ram_open,
    .proc_read = seq_read,
    .proc_lseek = seq_lseek,
    .proc_release = single_release,
};

static int __init ram_init(void) {
    proc_create(PROC_NAME, 0, NULL, &ram_ops);
    printk(KERN_INFO "ram_202201524 Modulo Cargado\n");
    return 0;
}

static void __exit ram_exit(void) {
    remove_proc_entry(PROC_NAME, NULL);
    printk(KERN_INFO "ram_202201524 Modulo Finalizado\n");
}

module_init(ram_init);
module_exit(ram_exit);