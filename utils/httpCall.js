import axios from 'axios';

export const httpCall = (url, optionsCall) => {
    const { method , headers, data, timeout = 0 } = optionsCall;

    return axios({
        url,
        method,
        headers,
        data,
        timeout
    }).then(result=>{
        return result;
    }).catch(err  =>{
        console.log("Error axios => ", err.response)
        if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') throw new Error('cannot connect');

        if (!err.response) throw err;

        const { response: { data: { errors } } } = err

        throw errors;
    });

}



