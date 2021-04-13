import React, { Component } from "react";
import './App.css';
import getWeb3 from "./getWeb3";
import Voting from "./contracts/Voting.json";


class User extends Component {  
    state = { web3: null, accounts: null, contract: null, step: 0, proposals: null, voters: null, winningDesc:null, winningID: null, winningCount: null, canHe:true};

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
        let isAVoter = await instance.methods.isRegisteredVoter(account).call();
        let heCan = true;
        if (isAVoter==false){
            heCan= false;
        }
        this.setState({ web3, accounts, contract: instance, canHe: heCan}, this.runInit);
      } catch (error) {
        alert( `Non-Ethereum browser detected. Can you please try to install MetaMask before starting.`, );
        console.error(error);
      }
    };

    runInit = async() => {
        const { contract } = this.state;
        let stepA = await contract.methods.getWorkflowStatus().call();
        const proposalsA = await contract.methods.showProposals().call();
        const winningID= await contract.methods.winningProposalId().call();
        const winningDesc= await contract.methods.getWinningProposalDescription().call();
        const winningCount= await contract.methods.getWinningProposalVoteCount().call();
        this.setState({ step: stepA, proposals: proposalsA, winningDesc:winningDesc, winningID: winningID, winningCount: winningCount });
    }; 

    propose = async() => {
        const { accounts, contract} = this.state;
        let prop= document.getElementById("propal").value;
        await contract.methods.propose(prop).send({from: accounts[0]});
    }

    vote = async() => {
        const { accounts, contract} = this.state;
        let voted = document.getElementById("votedId").value; 
        await contract.methods.vote(voted).send({from: accounts[0]});
    }

    checkVoter = async() => {
        const { contract, accounts } = this.state;
        const address = document.getElementById("checkAddress").value;
        const yesOrNo = await contract.methods.getVotedByAVoter(address).send({from: accounts[0]});
        document.getElementById("yesNo").innerHTML=yesOrNo;
    }


    render(){

        if (!this.state.web3) {
            return <div>Loading Web3, accounts, and contract...</div>;
          } 
        if (this.state.canHe==false){
            return window.location.href = "/notAllowed";
        }
        if( this.state.step == 0 ){
            return(      
                <div className="user">
                    <a href="/admin">Page admin</a> / <a href="/user">Reload la page (pour verifier les changement d'état)</a>
                    <h1>Bonjour Monsieur le voteur.</h1><p>La session de vote en est actuellement à l'étape {this.state.step}</p>
                    <h2>A cette étape, vous devez attendre que l'administrateur lance l'étape des propositions (ou vous rajoute a la whitelist, si ce n'est deja fait)</h2>
                </div>
            )
        }
        else if ( this.state.step == 1){
            return(      
                <div className="user">
                    <a href="/admin">Page admin</a> / <a href="/user">Reload la page (pour verifier les changement d'état)</a>
                    <h1>Bonjour Monsieur le voteur.</h1><p>La session de vote en est actuellement à l'étape {this.state.step}</p>
                    <h2>A cette étape, vous pouvez proposer des idées sur lesquelles voter ici:</h2>
                    <input type="text" id="propal" />
                    <button onClick={this.propose} >Check</button>              
                </div>
            )
        }
        else if ( this.state.step == 2){
            return(      
                <div className="user">
                    <a href="/admin">Page admin</a> / <a href="/user">Reload la page (pour verifier les changement d'état)</a>
                    <h1>Bonjour Monsieur le voteur.</h1><p>La session de vote en est actuellement à l'étape {this.state.step}</p>
                    <h2>A cette étape, vous devez attendre que l'administrateur lance l'étape des votes</h2>
                    <p>En attendant, voici l'ensemble des propositions qui ont été soumises au prochain vote: </p>
                    <p dangerouslySetInnerHTML={{__html: this.state.proposals}} />
                </div>
            )        
        }
        else if ( this.state.step == 3){
            return(      
                <div className="user">
                    <a href="/admin">Page admin</a> / <a href="/user">Reload la page (pour verifier les changement d'état)</a>
                    <h1>Bonjour Monsieur le voteur.</h1><p>La session de vote en est actuellement à l'étape {this.state.step}</p>
                    <h2>A cette étape, vous pouvez voter pour la meilleure idée. Vous pourrez changer votre vote jusqu'à la fin de cette étape.</h2>
                    <input type="text" id="votedId" />
                    <button onClick={this.vote} >Voter</button>       
                    <p dangerouslySetInnerHTML={{__html: this.state.proposals}} />
                </div>
            )
        }
        else if ( this.state.step == 4){
            return(      
                <div className="user">
                    <a href="/admin">Page admin</a> / <a href="/user>">Reload la page (pour verifier les changement d'état)</a>
                    <h1>Bonjour Monsieur le voteur.</h1><p>La session de vote en est actuellement à l'étape {this.state.step}</p>
                    <h2>A cette étape, les votes sont finis, vous devez attendre le comptage par l'admin.</h2>
                    <p>voici un récapitulatif des propositions et leur nombre de votes, merci</p>
                    <p dangerouslySetInnerHTML={{__html: this.state.proposals}} />
                </div>
            )
        }
        else if ( this.state.step == 5){
            return(      
                <div className="user">
                    <a href="/admin">Page admin</a> / <a href="/user>">Reload la page (pour verifier les changement d'état)</a>
                    <h1>Bonjour Monsieur le voteur.</h1><p>La session de vote en est actuellement à l'étape {this.state.step}</p>
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
export default User;