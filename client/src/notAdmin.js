import React from 'react';
import './App.css';

function NotAllowed(){
    return (
        <div className="homepage">
            <h1>Bienvenue pour ce nouveau defi : Système de vote</h1>
            <h2>Vous n'etes pas administrateur.</h2>
        </div>
    );
}

export default NotAllowed;