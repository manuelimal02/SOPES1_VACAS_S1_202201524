obj-m += cpu_202201524.o # obj-m es una variable que contiene el nombre del modulo a compilar
obj-m += ram_202201524.o # Se agrega otro modulo a compilar

all:
	make -C /lib/modules/$(shell uname -r)/build M=$(PWD) modules 

clean: # clean es una regla que se ejecuta para limpiar los archivos generados por la compilacion
	make -C /lib/modules/$(shell uname -r)/build M=$(PWD) clean