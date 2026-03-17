import {randomUUID} from "crypto";

export class User{
    constructor({id, name, lastname, username, email,  password}){
        if(!email.includes('@')) throw new Error("Email invalido");

        this.id = id || randomUUID();
        this.name = name;
        this.lastname = lastname;
        this.username = username;
        this.email = email;
        this.password = password
    }
}