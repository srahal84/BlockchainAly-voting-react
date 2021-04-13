import React from 'react';
import './App.css';

function Home(){
    return (
        <div className="homepage">
            <h1>Bienvenue pour ce nouveau defi : Système de vote</h1>
            <div>En cliquant sur ce bouton, vous allez pouvoir voter dans la blockchain.</div>
            <a href="/connect"><button>Voter !</button></a>
        </div>
    );
}

export default Home;