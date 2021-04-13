import React, { Component } from "react";
import './App.css';
import getWeb3 from "./getWeb3";
import Voting from "./contracts/Voting.json";


class Admin extends Component {  
    state = { web3: null, accounts: null, contract: null, step: 0, proposals: null, winningDesc:null, winningID: 0, canHe:false};


    componentDidMount = async () => {

      try {
        const web3 = await getWeb3();
        const accounts = await web3.eth.getAccounts();
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = Voting.networks[networkId];
        const instance = new web3.eth.Contract(
          Voting.abi,
          deployedNetwork && deployedNetwork.address,
        );
        const account = accounts[0];
        let admin = await instance.methods.owner().call();
        let heCan=true;
        if(account!=admin){
            heCan=false;
        }
        this.setState({ web3, accounts, contract: instance, canHe:heCan }, this.runInit);
      } catch (error) {
        alert(
          `Non-Ethereum browser detected. Can you please try to install MetaMask before starting.`,
        );
        console.error(error);
      }
    };

    runInit = async() => {

        const { contract } = this.state;
        console.log("yey");
        let stepA = await contract.methods.getWorkflowStatus().call();
        const proposalsA = await contract.methods.showProposals().call();
        const winningID= await contract.methods.winningProposalId().call();
        const winningDesc= await contract.methods.getWinningProposalDescription().call();
        const winningCount= await contract.methods.getWinningProposalVoteCount().call();
        this.setState({ step: stepA, proposals: proposalsA, winningDesc:winningDesc, winningID: winningID, winningCount: winningCount });
    }; 

    nextStep = async() => {
        const { contract,accounts } = this.state;

        await contract.methods.nextStep().send({from: accounts[0]});

        let step=this.state.step;
        step ++;
        this.setState({ step: step});
    }

    registerVoter = async() => {
        const { accounts, contract } = this.state;
        const address = document.getElementById("address").value;
        await contract.methods.registerVoter(address).send({from: accounts[0]});
    }

    checkVoter = async() => {
        const { contract } = this.state;
        const address = document.getElementById("checkAddress").value;
        const yesOrNo = await contract.methods.getVotedByAVoter(address).call();
        document.getElementById("yesNo").innerHTML=yesOrNo;
    }


    render(){
        if (!this.state.web3) {
            return <div>Loading Web3, accounts, and contract...</div>;
          } 
        if (this.state.canHe==false){
            return window.location.href = "/notAdmin";
        }
        if( this.state.step == 0 ){
            return(      
                <div className="admin">
                    <a href="/admin">Reload la page (pour verifier les changement d'état)</a> / <a href="/user">Page User</a>
                    <h1>Bonjour Monsieur l'Admin.</h1><p>La session de vote en est actuellement à l'étape {this.state.step}</p>Vous pouvez passer a l'étape suivante en cliquant sur ce bouton<button onClick={this.nextStep}>Next Step!</button>
                    <h2>A cette étape, vous pouvez ajouter des adresses à whitelister: </h2>
                    <input type="text" id="address"  />
                    <button onClick={this.registerVoter} > Envoyer </button>
                </div>
            )
        }
        else if ( this.state.step == 1){
            return(      
                <div className="admin">
                    <a href="/admin">Reload la page (pour verifier les changement d'état)</a> / <a href="/user">Page User</a>
                    <h1>Bonjour Monsieur l'Admin.</h1><p>La session de vote en est actuellement à l'étape {this.state.step}</p>Vous pouvez passer a l'étape suivante en cliquant sur ce bouton, attention soyez sur de ce que vous faites.<button onClick={this.nextStep}>Next Step!</button>
                   <h2>A cette étape, vous ne pouvez rien faire. Juste aller a l'étape suivante quand c'est la fin des propositions.</h2>
                </div>
            )
        }
        else if ( this.state.step == 2){
            return(      
                <div className="admin">
                    <a href="/admin">Reload la page (pour verifier les changement d'état)</a> / <a href="/user">Page User</a>
                    <h1>Bonjour Monsieur l'Admin.</h1><p>La session de vote en est actuellement à l'étape {this.state.step}</p>Vous pouvez passer a l'étape suivante en cliquant sur ce bouton, attention soyez sur de ce que vous faites.<button onClick={this.nextStep}>Next Step!</button>
                    <h2>A cette étape, vous ne pouvez que passer a l'étape suivante.</h2>
                    <p>En attendant, voici l'ensemble des propositions qui ont été soumises au prochain vote: </p>
                    <p dangerouslySetInnerHTML={{__html: this.state.proposals}} />
                </div>
            )        
        }
        else if ( this.state.step == 3){
            return(      
                <div className="admin">
                    <a href="/admin">Reload la page (pour verifier les changement d'état)</a> / <a href="/user">Page User</a>
                    <h1>Bonjour Monsieur l'Admin.</h1><p>La session de vote en est actuellement à l'étape {this.state.step}</p>Vous pouvez passer a l'étape suivante en cliquant sur ce bouton, attention soyez sur de ce que vous faites.<button onClick={this.nextStep}>Next Step!</button>
                    <h2>A cette étape, vous ne pouvez rien faire. Juste aller a l'étape suivante quand c'est la fin des votes.</h2>
                    <p dangerouslySetInnerHTML={{__html: this.state.proposals}} />
                </div>
            )
        }
        else if ( this.state.step == 4){
            return(      
                <div className="admin">
                    <a href="/admin">Reload la page (pour verifier les changement d'état)</a> / <a href="/user">Page User</a>
                    <h1>Bonjour Monsieur l'Admin.</h1><p>La session de vote en est actuellement à l'étape {this.state.step}</p>Vous pouvez passer a l'étape suivante en cliquant sur ce bouton, attention soyez sur de ce que vous faites.<button onClick={this.nextStep}>Next Step!</button>
                    <h2>Fin des votes! Passer à l'étape suivante quand vous voulez comptabiliser les votes pour le gagnant</h2>
                    <p dangerouslySetInnerHTML={{__html: this.state.proposals}} />
                </div>
            )
        }
        else if ( this.state.step == 5){
            return(      
                <div className="admin">
                    <a href="/admin">Reload la page (pour verifier les changement d'état)</a> / <a href="/user">Page User</a>
                    <h1>Bonjour Monsieur l'Admin.</h1><p>La session de vote en est actuellement à l'étape {this.state.step}. Fin des votations.</p>
                    <h2>Nous avons notre grand gagnant! C'est la proposition {this.state.winningDesc}, de numéro d'id {this.state.winningID} avec {this.state.winningCount} votes. </h2>
                    <p>Si vous voulez voir pour qui a voté un utilisateur, rentrez son adress ici:</p>
                    <input type="text" id="checkAddress" />
                    <button onClick={this.checkVoter} >Check</button>
                    <div id="yesNo"></div>
                    <p dangerouslySetInnerHTML={{__html: this.state.proposals}} />
                </div>
            )
        }
    }

}
export default Admin;