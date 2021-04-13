import React, { Component } from "react";
import './App.css';
import getWeb3 from "./getWeb3";
import Voting from "./contracts/Voting.json";


class Connect extends Component {  
    state = {  web3: null, account: null, owner: null};

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
        this.setState({ web3, account: account, owner : admin});
      } catch (error) {
        alert(
          `Non-Ethereum browser detected. Can you please try to install MetaMask before starting.`,
        );
        console.error(error);
      }
    };

    render() {
      if (!this.state.web3) {
        return <div>Chargement...</div>;
      } 
      if (this.state.account===this.state.owner){
          return window.location.href = "/admin";
      } else {
        return window.location.href = "/user";
      }     
    }
  
}

export default Connect;