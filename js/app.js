// methods to save and retrieve data from localStorage
function saveMatch(matchId, dataObj) {
  localStorage.setItem(matchId, JSON.stringify(dataObj));
}

function getMatch(matchId) {
  try {
    return JSON.parse(localStorage.getItem(matchId));
  } catch (e) {
    return undefined;
  }
}

function getValidMatches() {
  var matches = [];
  for (var key in localStorage) {
    if (!key) continue;
    var match = getMatch(key);
    if (match) {
      matches.push(match);
    }
  }
  return matches;
}

var MATCH_REF;

/* Home Page Component */
const Home = {
  template: '#home',
  data: function () {
    return {
      matches: getValidMatches()
    }
  },
  methods: {
    selectMatch: function (match) {
      MATCH_REF = 'match-' + new Date(match.createdTime).getTime();
      router.push("/game");
    }
  }
}

/* Start Page Component */
const Start = {
  template: '#start',
  data: function () {
    return {
      teamA: '',
      teamB: '',
      numOvers: '',
      isWideARun: false,
      // isWideBallCounts : false,
      isRegisterTeam: false
    }
  },
  methods: {
    handleLetsBegin: function () {
      var alertMessage = '';
      if (!this.teamA) alertMessage += 'Team A name. ';
      if (!this.teamB) alertMessage += 'Team B name. ';
      if (!this.numOvers || this.numOvers == 0) alertMessage += 'num overs. ';
      if (alertMessage) {
        alert('Make sure ' + alertMessage + 'are valid');
        return;
      }
      var that = this;
      var currentMatch = {
        key: new Date().getTime(),
        teamA: {
          name: that.teamA,
          totalScore: 0,
          wickets: 0,
          overs: 0,
          balls: 0
        },
        teamB: {
          name: that.teamB,
          totalScore: 0,
          wickets: 0,
          overs: 0,
          balls: 0
        },
        isWideARun: that.isWideARun,
        isRegisterTeam: that.isRegisterTeam,
        numOvers: that.numOvers,
        whosBatting: '',
        currentInnings: 0,
        createdTime: new Date(),
      };
      //'MMMM Do YYYY, h:mm:ss a'
      currentMatch.displayDate = moment(currentMatch.createdTime, 'YYYY-MM-DD').format('MM/DD/YY HH:mm:ss');
      // CURRENT_MATCH = currentMatch;
      MATCH_REF = 'match-' + currentMatch.createdTime.getTime();
      saveMatch(MATCH_REF, currentMatch);
      router.push('toss');
    }
  }
}
/* Toss Page Component */
const Toss = {
  template: '#toss',
  data: function () {
    return {
      message: undefined,
      isChecking: false,
      buttonText: 'Decide'
    }
  },
  methods: {
    checkWhosBattingFirst: function () {
      this.buttonText = 'Check Again?'
      this.isChecking = true;
      var result = Math.floor(Math.random() * (1 - 0 + 1)) + 0;
      var that = this;
      setTimeout(function () {
        that.isChecking = false;
        var currentMatch = getMatch(MATCH_REF);
        currentMatch.whoWon = result == 0 ? currentMatch.teamA.name : currentMatch.teamB.name;
        that.message = currentMatch.whoWon;
        currentMatch.whosBatting = that.message;
        currentMatch.currentInnings = 1;
        saveMatch(MATCH_REF, currentMatch);
      }, 1000)
    }
  }
}
/* Game Page Component */
const Game = {
  template: '#game',
  data: function () {
    return {
      currentMatch: getMatch(MATCH_REF)
    }
  },
  created : function(){
    var data = getMatch(MATCH_REF);
    if(!data) {
      router.push('/');
      window.location.reload();
    }
  },
  computed: {
    boardColorTeamA: function () {
      return {
        'btn-secondary': this.currentMatch.whosBatting != this.currentMatch.teamA.name,
        'btn-success': this.currentMatch.whosBatting == this.currentMatch.teamA.name
      }
    },
    boardColorTeamB: function () {
      return {
        'btn-secondary': this.currentMatch.whosBatting != this.currentMatch.teamB.name,
        'btn-success': this.currentMatch.whosBatting == this.currentMatch.teamB.name
      }
    },
    requiredRuns: function () {
      var battingTeam = this.currentMatch.whosBatting == this.currentMatch.teamA.name ? this.currentMatch.teamA : this.currentMatch.teamB;
      var bowlingTeam = this.currentMatch.whosBatting == this.currentMatch.teamA.name ? this.currentMatch.teamB : this.currentMatch.teamA;
      var output = bowlingTeam.totalScore - battingTeam.totalScore;
      return output > 0 ? String(output + 1) : String(0);
    },
    requiredBalls: function () {
      var battingTeam = this.currentMatch.whosBatting == this.currentMatch.teamA.name ? this.currentMatch.teamA : this.currentMatch.teamB;
      return String(((this.currentMatch.numOvers - battingTeam.overs) * 6) - battingTeam.balls);
    }
  },
  methods: {
    showRunsRequiredBoard: function () {
      var battingTeam = this.currentMatch.whosBatting == this.currentMatch.teamA.name ? this.currentMatch.teamA : this.currentMatch.teamB;
      return battingTeam.overs >= this.currentMatch.numOvers / 2 && this.currentMatch.currentInnings == 2;
    },
    addScore: function (runs) {
      var battingTeam = this.currentMatch.whosBatting == this.currentMatch.teamA.name ? this.currentMatch.teamA : this.currentMatch.teamB;
      var bowlingTeam = this.currentMatch.whosBatting == this.currentMatch.teamA.name ? this.currentMatch.teamB : this.currentMatch.teamA;
      var countBalls = true;
      if (runs == 99 || runs == 999) {
        if (this.currentMatch.isWideARun) {
          runs = 1;
          countBalls = false;
        } else {
          runs = 0;
          countBalls = false;
        }
      }
      if (countBalls) battingTeam.balls++;

      battingTeam.totalScore += runs;

      if (this.currentMatch.currentInnings == 2 && battingTeam.totalScore > bowlingTeam.totalScore) {
        alert('Congrats ' + battingTeam.name);
        this.endInnings();
      }

      if (battingTeam.balls == 6) {
        battingTeam.balls = 0;
        battingTeam.overs++;
        if (battingTeam.overs >= this.currentMatch.numOvers) {
          this.endInnings();
        }
      }
      saveMatch(MATCH_REF, this.currentMatch);
    },
    out: function () {
      var battingTeam = this.currentMatch.whosBatting == this.currentMatch.teamA.name ? this.currentMatch.teamA : this.currentMatch.teamB;
      battingTeam.wickets++;
      battingTeam.balls++;
      if (battingTeam.balls == 6) {
        battingTeam.balls = 0;
        battingTeam.overs++;
        if (battingTeam.overs >= this.currentMatch.numOvers) {
          this.endInnings();
        }
      }
      saveMatch(MATCH_REF, this.currentMatch);
    },
    endInnings: function () {
      if (this.currentMatch.currentInnings == 2) {
        saveMatch(MATCH_REF, this.currentMatch);
        alert('Match is done!');
        router.push("/");
        return;
      }
      var userInput = confirm('Innings Complete! Start the second one?');
      if (userInput) {
        this.currentMatch.whosBatting = this.currentMatch.whosBatting == this.currentMatch.teamA.name ? this.currentMatch.teamB.name : this.currentMatch.teamA.name
        this.currentMatch.currentInnings = 2;
      }
      saveMatch(MATCH_REF, this.currentMatch);
    }
  }
}

/* Router Implementation */
const routes = [
  { path: '/', component: Home },
  { path: '/start', component: Start },
  { path: '/toss', component: Toss },
  { path: '/game', component: Game }
]

// Creating Router and adding required routes
const router = new VueRouter({
  routes // short for `routes: routes`
})

// Mount the router
const app = new Vue({
  router
}).$mount('#app')
