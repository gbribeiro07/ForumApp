import axios from "axios";
//npm i axios

const API_BASE_URL = 'http:/localhost:3001/Api';
//se estiver rodando em um celular ou emulador terá que modificar
//localhost nao funcionará. Será preciso do ID da máquina
//EX.: http://192.168.1.XX:3001

const Api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-TYpe': 'application/json',
    },
})

export default Api;