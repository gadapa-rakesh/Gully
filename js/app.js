// Data
var MATCHES = [];
var CURRENT_MATCH;

// window.onbeforeunload = function(){
//   return 'Data will be lost, Save it first. Are you sure?'
// }

// 0. If using a module system (e.g. via vue-cli), import Vue and VueRouter and then call `Vue.use(VueRouter)`.

// 1. Define route components.
// These can be imported from other files
const Home = {
  template: '#home',
  data : function(){
    return {
      message : 'hi there'
    }
  },
  methods : {
    clickMeAndSee : function(){
      this.message = "hello";
    }
  }
}
const Start = { 
  template: '#start',
  data: function(){
    return {
      teamA : '',
      teamB : '',
      numOvers : '',
      isWideARun : false,
      // isWideBallCounts : false,
      isRegisterTeam : false
    }
  },
  methods: {
    handleLetsBegin : function(){
      var alertMessage = '';
      if(!this.teamA) alertMessage += 'Team A name. ';
      if(!this.teamB) alertMessage += 'Team B name. ';
      if(!this.numOvers || this.numOvers == 0) alertMessage += 'num overs. ';
      if(alertMessage){
        alert('Make sure '+alertMessage+'are valid');
        return;
      }
      var that = this;
      var currentMatch = {
        key : new Date().getTime(),
        teamA : {
          name : that.teamA,
          totalScore : 0,
          wickets : 0,
          overs : 0,
          balls : 0
        },
        teamB : {
          name : that.teamB,
          totalScore : 0,
          wickets : 0,
          overs : 0,
          balls : 0
        },
        isWideARun : that.isWideARun,
        isRegisterTeam : that.isRegisterTeam,
        numOvers : that.numOvers,
        whosBatting : '',
        currentInnings : 0
      };
      CURRENT_MATCH = currentMatch;
      router.push('toss');
    }
  }
}
const Toss = {
  template: '#toss',
  data: function(){
    return {
      message:undefined,
      isChecking:false,
      buttonText: 'Decide'
    }
  },
  methods: {
    checkWhosBattingFirst : function(){
      this.buttonText = 'Check Again?'
      this.isChecking = true;
      var result = Math.floor(Math.random() * (1 - 0 + 1)) + 0;
      var that = this;
      setTimeout(function(){
        that.isChecking = false;
        CURRENT_MATCH.whoWon = result==0 ? CURRENT_MATCH.teamA.name : CURRENT_MATCH.teamB.name;
        that.message = CURRENT_MATCH.whoWon;
        CURRENT_MATCH.whosBatting = that.message;
        CURRENT_MATCH.currentInnings = 1;
      }, 1000)
    }
  }
}

const Game = { 
  template: '#game',
  data : function(){
    return {
      currentMatch : CURRENT_MATCH
    }
  },
  computed: {
    boardColorTeamA : function(){
      return {
        'btn-secondary' : this.currentMatch.whosBatting != this.currentMatch.teamA.name,
        'btn-success' : this.currentMatch.whosBatting == this.currentMatch.teamA.name
      }
    },
    boardColorTeamB : function(){
      return {
        'btn-secondary' : this.currentMatch.whosBatting != this.currentMatch.teamB.name,
        'btn-success' : this.currentMatch.whosBatting == this.currentMatch.teamB.name
      }
    },
    requiredRuns : function(){
      var battingTeam = this.currentMatch.whosBatting == this.currentMatch.teamA.name ? this.currentMatch.teamA : this.currentMatch.teamB;
      var bowlingTeam = this.currentMatch.whosBatting == this.currentMatch.teamA.name ? this.currentMatch.teamB : this.currentMatch.teamA;
      var output = bowlingTeam.totalScore - battingTeam.totalScore;
      return output > 0 ? String(output + 1) : String(0);
    },
    requiredBalls : function(){
      var battingTeam = this.currentMatch.whosBatting == this.currentMatch.teamA.name ? this.currentMatch.teamA : this.currentMatch.teamB;
      return String(((this.currentMatch.numOvers - battingTeam.overs) * 6) - battingTeam.balls);
    }
  },
  methods : {
    showRunsRequiredBoard : function(){
      var battingTeam = this.currentMatch.whosBatting == this.currentMatch.teamA.name ? this.currentMatch.teamA : this.currentMatch.teamB;
      return battingTeam.overs >= this.currentMatch.numOvers/2 && this.currentMatch.currentInnings == 2;
    },
    addScore : function(runs){
      var battingTeam = this.currentMatch.whosBatting == this.currentMatch.teamA.name ? this.currentMatch.teamA : this.currentMatch.teamB;
      var bowlingTeam = this.currentMatch.whosBatting == this.currentMatch.teamA.name ? this.currentMatch.teamB : this.currentMatch.teamA;
      var countBalls = true;
      if(runs == 99 || runs == 999) {
        if(this.currentMatch.isWideARun){
          runs = 1;
          countBalls = false;
        } else {
          runs = 0;
          countBalls = false;
        }
      }
      if(countBalls) battingTeam.balls++;

      battingTeam.totalScore += runs;

      if(this.currentMatch.currentInnings == 2 && battingTeam.totalScore > bowlingTeam.totalScore){
        alert('Congrats '+battingTeam.name);
        this.endInnings();
      }

      if(battingTeam.balls == 6){
        battingTeam.balls = 0;
        battingTeam.overs++;
        if(battingTeam.overs >= this.currentMatch.numOvers){
          this.endInnings();
        }
      }
    },
    out : function(){
      var battingTeam = this.currentMatch.whosBatting == this.currentMatch.teamA.name ? this.currentMatch.teamA : this.currentMatch.teamB;
      battingTeam.wickets++;
      battingTeam.balls++;
      if(battingTeam.balls == 6){
        battingTeam.balls = 0;
        battingTeam.overs++;
        if(battingTeam.overs >= this.currentMatch.numOvers){
          this.endInnings();
        }
      }
    },
    endInnings : function(){
      if(this.currentMatch.currentInnings == 2){
        alert('Match is done!');
        router.push("/");
        return;
      }
      var userInput = confirm('Innings Complete! Start the second one?');
      if(userInput){
        this.currentMatch.whosBatting = this.currentMatch.whosBatting == this.currentMatch.teamA.name ? this.currentMatch.teamB.name : this.currentMatch.teamA.name
        this.currentMatch.currentInnings = 2;
      }
    }
  }
}

// 2. Define some routes
// Each route should map to a component. The "component" can
// either be an actual component constructor created via
// `Vue.extend()`, or just a component options object.
// We'll talk about nested routes later.
const routes = [
  { path: '/', component: Home },
  { path: '/start', component: Start },
  { path: '/toss', component: Toss },
  { path: '/game', component: Game }
]

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = new VueRouter({
  routes // short for `routes: routes`
})

// 4. Create and mount the root instance.
// Make sure to inject the router with the router option to make the
// whole app router-aware.
const app = new Vue({
  router
}).$mount('#app')

// Now the app has started!
