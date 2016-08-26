# Sincronização de Relógios entre Servidores

Trabalho de Sistemas Distribuídos, UNEMAT, 2016/1.

# Preparando o host

Instale o *Git* para clonar este repositório.

```
sudo apt-get install git
```

Gerenciador de versões para o Node.js, um ambiente de execução baseado
no interpretador de JavaScript **V8** (interpretador *open-source*
criado pelo Google e utilizado pelo Chrome).

```
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.31.4/install.sh | bash
```

Instale o Node.js (A versão utilizada pelo projeto é a 6.2.1).

```
nvm install v6.2.1
```

# Executando a aplicação

Clone o projeto e mude para o diretório criado.

```sh
git clone https://bitbucket.org/iquabius/unemat-16-1-sd-sincronizacao.git sd-sincro
cd sd-sincro
```

Instale as dependências do projeto listadas no arquivo *package.json*,
utilizando o `npm`, o gerenciador de pacotes do Node.js.

```
npm install
```

Execute a aplicação (o commando **start** está definido no arquivo
*package.json*):

```
npm start
```
