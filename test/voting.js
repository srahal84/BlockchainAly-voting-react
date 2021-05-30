const { BN } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const Voting = artifacts.require("Voting");

contract('Voting', function (accounts) {
    const admin = accounts[0];
    const voter1 = accounts[1];
    const voter2 = accounts[2];

    let VotingInstance;

    const status = {
        0 :'RegisteringVoters',
        1 :'ProposalsRegistrationStarted',
        2 :'ProposalsRegistrationEnded',
        3 :'VotingSessionStarted',
        4 :'VotingSessionEnded',
        5 :'VotesTallied'
    };

    beforeEach(async function () {
        VotingInstance = await Voting.new({from: admin});
    });

    it("Adminc can add voters", async () => {
        expect(await VotingInstance.isRegisteredVoter(voter1, {from: admin})).to.equal(false);
        await VotingInstance.registerVoter(voter1, {from: admin});
        expect(await VotingInstance.isRegisteredVoter(voter1, {from: admin})).to.equal(true);
    });

    it("Admin can start proposal session", async () => {
        expect( await VotingInstance.getWorkflowStatus()).to.be.bignumber.equal('0');
        await VotingInstance.nextStep({from: admin}); 
        expect( await VotingInstance.getWorkflowStatus()).to.be.bignumber.equal('1');
    });
        
    it("Voter can propose an idea", async () => {
        await VotingInstance.registerVoter(admin, {from: admin});
        await VotingInstance.registerVoter(voter1, {from: admin});
        await VotingInstance.nextStep({from: admin});
        expect( await VotingInstance.getProposalsCount()).to.be.bignumber.equal('0');
        await VotingInstance.propose('aaa', {from: admin});
        await VotingInstance.propose('bbb', {from: voter1});
        // test cant pass if voter2 want to propose because he is not in voters list
        // await VotingInstance.propose('bbb', {from: voter2});
        expect( await VotingInstance.getProposalsCount()).to.be.bignumber.equal('2');
    });
    
    it("Admin can go through all steps of the voting process", async () => {
        expect( await VotingInstance.getWorkflowStatus()).to.be.bignumber.equal('0');
        await VotingInstance.nextStep({from: admin}); 
        expect( await VotingInstance.getWorkflowStatus()).to.be.bignumber.equal('1');
        await VotingInstance.nextStep({from: admin}); 
        expect( await VotingInstance.getWorkflowStatus()).to.be.bignumber.equal('2');
        await VotingInstance.nextStep({from: admin}); 
        expect( await VotingInstance.getWorkflowStatus()).to.be.bignumber.equal('3');
        await VotingInstance.nextStep({from: admin}); 
        expect( await VotingInstance.getWorkflowStatus()).to.be.bignumber.equal('4');
        await VotingInstance.nextStep({from: admin}); 
        expect( await VotingInstance.getWorkflowStatus()).to.be.bignumber.equal('5');
    });

    it("Voter can  vote", async () => {
        await VotingInstance.registerVoter(admin, {from: admin});
        await VotingInstance.registerVoter(voter1, {from: admin});
        await VotingInstance.nextStep({from: admin});
        await VotingInstance.propose('aaa', {from: admin});
        await VotingInstance.propose('bbb', {from: voter1});
        await VotingInstance.nextStep({from: admin});
        await VotingInstance.nextStep({from: admin});

        await VotingInstance.vote(0, {from: voter1});
        await VotingInstance.vote(0, {from: admin});

        expect(await VotingInstance.getVotedByAVoter(admin, {from: admin})).to.be.bignumber.equal('0');
        expect(await VotingInstance.getVotedByAVoter(voter1, {from: admin})).to.be.bignumber.equal('0');;
    });

    it("Counting is ok", async () => {
        await VotingInstance.registerVoter(admin, {from: admin});
        await VotingInstance.registerVoter(voter1, {from: admin});
        await VotingInstance.nextStep({from: admin});
        await VotingInstance.propose('aaa', {from: admin});
        await VotingInstance.propose('bbb', {from: voter1});
        await VotingInstance.nextStep({from: admin});
        await VotingInstance.nextStep({from: admin});
        await VotingInstance.vote(1, {from: voter1});
        await VotingInstance.vote(1, {from: admin});
        await VotingInstance.nextStep({from: admin});
        await VotingInstance.nextStep({from: admin});

        expect(await VotingInstance.winningProposalId({from: admin})).to.be.bignumber.equal('1');
        
    });

});
