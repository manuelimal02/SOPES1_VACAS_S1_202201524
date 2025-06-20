obj-m += cpu_202201524.o
obj-m += ram_202201524.o
obj-m += procesos_202201524.o

all:
	make -C /lib/modules/$(shell uname -r)/build M=$(PWD) modules 

clean:
	make -C /lib/modules/$(shell uname -r)/build M=$(PWD) clean