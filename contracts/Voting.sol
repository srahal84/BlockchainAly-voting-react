// SPDX-License-Identifier: MIT
pragma solidity 0.6.11;
import "./Ownable.sol";

contract Voting is Ownable{
    
    mapping (address => Voter) public voters;
    uint public winningProposalId=0;
    
    event VoterRegistered(address voterAddress);
    event ProposalsRegistrationStarted();
    event ProposalsRegistrationEnded();
    event ProposalRegistered(uint proposalId);
    event VotingSessionStarted();
    event VotingSessionEnded();
    event Voted (address voter, uint proposalId);
    event VotesTallied();
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    
    struct Voter {
        bool isRegistered; 
        bool hasVoted;
        uint votedProposalId;
    }

    struct Proposal {
        string description;
        uint voteCount;
    }
    Proposal[] public proposals;
    
    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }
    WorkflowStatus public status;
    
    /*admin*/
    
    function registerVoter(address _address) public onlyOwner{
        require(status == WorkflowStatus.RegisteringVoters, "pas le bon moment");
        require(voters[_address].isRegistered == false, "t'as deja voté");
        voters[_address].isRegistered = true;
        voters[_address].hasVoted = false;
        emit VoterRegistered(_address);
    }
    
    function countVotes() internal onlyOwner {
        require(status == WorkflowStatus.VotingSessionEnded);
        winningProposalId=0;
        for(uint i = 1; i < proposals.length; i++){
            if(proposals[i].voteCount > proposals[winningProposalId].voteCount){
                winningProposalId = i;
            }
        }
            stepTallied();
    }

    function nextStep () public onlyOwner returns (uint){
        uint step= uint(status);
        if(step == 0){
            stepProposalstart();
        }
        if(step == 1){
           stepProposalstop();
        }
        if(step == 2){
           stepVotingStart();
        }
        if(step == 3){
            stepVotingStop();
        }
        if(step == 4){
            countVotes();
        }
        return getWorkflowStatus();
    }

    /* changer les états */

    function changeStatus(WorkflowStatus _status) internal onlyOwner {
        emit WorkflowStatusChange(status, _status);
        status = _status;
    }
  
    function stepProposalstart() internal onlyOwner {
        require(status == WorkflowStatus.RegisteringVoters);
        emit ProposalsRegistrationStarted();
        changeStatus(WorkflowStatus.ProposalsRegistrationStarted);
    }
    
    function stepProposalstop() internal onlyOwner {
        require(status == WorkflowStatus.ProposalsRegistrationStarted);
        emit ProposalsRegistrationEnded();
        changeStatus(WorkflowStatus.ProposalsRegistrationEnded);
    }
    
    function stepVotingStart() internal onlyOwner {
        require(status == WorkflowStatus.ProposalsRegistrationEnded);
        emit VotingSessionStarted();
        changeStatus(WorkflowStatus.VotingSessionStarted);
    }
    
    function stepVotingStop() internal onlyOwner {
        require(status == WorkflowStatus.VotingSessionStarted);
        emit VotingSessionEnded();
        changeStatus(WorkflowStatus.VotingSessionEnded);
    }

    function stepTallied() internal onlyOwner {
        require(status == WorkflowStatus.VotingSessionEnded);
        emit VotesTallied();
        changeStatus(WorkflowStatus.VotesTallied);

    }
     
    /* pour les voteurs */
    
    function propose(string calldata _description) public {
        require (status == WorkflowStatus.ProposalsRegistrationStarted, "ce n'est pas le moment de faire des propositions!");
        require (voters[msg.sender].isRegistered, "vous n'etes pas autorisé à participer au vote");
        emit ProposalRegistered(proposals.length);
        proposals.push(Proposal(_description, 0));
    }
    
    function vote(uint _proposalId) public {
        require(status == WorkflowStatus.VotingSessionStarted , "ce n'est pas le moment de voter!");
        require( voters[msg.sender].isRegistered, "vous n'etes pas autorisé a voter");
        require( !voters[msg.sender].hasVoted, "vous avez déjà voté");
        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposalId = _proposalId;
        proposals[_proposalId].voteCount++;
        emit Voted(msg.sender, _proposalId);
    }

    /* Getters */

    function getWinningProposalDescription() public view returns (string memory) {
        if (status == WorkflowStatus.VotesTallied){
            return proposals[winningProposalId].description;
        }
        else return "0";
    }
    
    function getWinningProposalVoteCount() public view returns (uint) {
        if (status == WorkflowStatus.VotesTallied){
            return proposals[winningProposalId].voteCount;
        }
        else return 0;
    }
    
    function isRegisteredVoter(address _voterAddress) public view returns (bool) {
        return voters[_voterAddress].isRegistered;
    }

    function getVotedByAVoter(address _voteraddress) public view returns (uint) {
        return voters[_voteraddress].votedProposalId;
    }
    
    function getWorkflowStatus() public view returns (uint ) {
        string memory result = "";
        uint step= uint(status);
        if(step == 0){
            result = "Enregistrement des utilisateurs en cours";
            return step;
        }
        if(step == 1){
            result = "Propositions en cours";
            return step;
        }
        if(step == 2){
            result = "Fin des propositions";
            return step;
        }
        if(step == 3){
            result = "Votes en cours";
            return step;
        }
        if(step == 4){
            result = "Votes clos";
            return step;
        }
        if(step == 5){
            result = "Fin des votes, vous pouvez voir voir les résultats";
            return step;
        }
    }


    function showProposals() public view returns (string memory){
        string memory total = "Voici les propositions: ";
        string memory endline= ".\n Suivante: ";
        string memory descDesc = ", decrite par:  ";
        string memory idDesc = "proposition numero ";
        string memory voteCountedDesc = ", a recu ce nombre de vote: "; 
        string memory desc = "";
        string memory id = "";
        string memory voteCounted = ""; 
        for(uint i = 0; i < proposals.length; i++){
            desc= proposals[i].description;
            id= uint2str(i);
            voteCounted= uint2str (proposals[i].voteCount);
            total = string (abi.encodePacked(total, idDesc, id, descDesc, desc, voteCountedDesc, voteCounted, endline ));
        }
        return total;
    }
    function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len - 1;
        while (_i != 0) {
            bstr[k--] = byte(uint8(48 + _i % 10));
            _i /= 10;
        }
        return string(bstr);
    }

}