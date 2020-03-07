<template>
  <div class="LoginForm">
    <div class="columns is-centered">
      <div class="box">
          <form @submit.prevent="submit">
            <b-field grouped>
              <b-input v-model="username" placeholder="Username" type="text"> </b-input>
            </b-field>

            <b-field  grouped>
              <b-input v-model="password" placeholder="Password" type="password" password-reveal></b-input>
            </b-field>
            <hr>
            <b-field><!-- Label left empty for spacing -->
              <p class="control">
                  <button type="submit" class="button is-primary" :class="{'is-loading':loading}">
                    Login
                  </button>
              </p>
            </b-field>
          </form>        
      </div>
    </div>
  </div>
</template>

<script>
import { CognitoUserPool, AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js';

var poolData = {
    UserPoolId: 'eu-west-1_ESQzI4Jrf',
    ClientId: '62g3d0us337ls5jg1rahgsehfs'
}
var userPool = new CognitoUserPool(poolData);

export default {
  name: 'LoginForm',
  data: function () {
    return {
      username: '',
      password: '',
      loading: false
    }
  },
  methods: {
    submit () {
      this.loading = true

      var authenticationData = {
        Username: this.username,
        Password: this.password,
      };
      var authenticationDetails = new AuthenticationDetails(
        authenticationData
      );
      var userData = {
        Username: this.username,
        Pool: userPool,
      };

      this.$store.commit('setPoolData', userPool)

      var mythis = this

      var cognitoUser = new CognitoUser(userData);

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function() {
          mythis.loading = false
          mythis.$buefy.snackbar.open({
            message: "Login succesfull",
            queue: false
          })
          mythis.$router.push('/')
        },
        onFailure: function(err) {
          mythis.loading = false
          mythis.$buefy.snackbar.open({
            message: err.message || JSON.stringify(err),
            queue: false
          })
        },
        mfaRequired: function() {
          var verificationCode = prompt('Please input verification code' ,'');
          cognitoUser.sendMFACode(verificationCode, this);
        },    
        newPasswordRequired: function(userAttributes) {
          delete userAttributes.email_verified
          mythis.loading = false
          cognitoUser.completeNewPasswordChallenge(mythis.password, userAttributes, this)
        }
      });
    }
  }
}
</script>