<template>
  <div class="home">
    <nav class="breadcrumb" aria-label="breadcrumbs">
      <ul>
        <li v-for="(title,index) in titleStack" :key="index">
          {{ title }}
        </li>
      </ul>
    </nav>
    <div class="buttons">
      <b-button @click="listalbum" type="is-light" v-for="(title,index) in albums" :key="index">
        {{ title.Prefix }}
      </b-button>
    </div>
    <div class="section">
        <div v-for="images in chunkedImages"  v-bind:key="images.index" class="columns">
          <div v-for="image in images"  v-bind:key="image.index" class="column is-2">
            <figure class="image">
              <img v-bind:src="image.url">
            </figure> 
          </div>   
        </div>   
    </div>
  </div>
</template>

<script>
var AWS = require('aws-sdk');
var chunk = require('chunk')

export default {
  name: 'Home',
  components: { },
  data: function () {
    return {
      albums: [ ],
      images: [ ],
      titleStack: ["/"]
    }
  },
  mounted () {
    var mythis = this;

    var userPool = this.$store.getters.pooldata;
    var cognitoUser = userPool.getCurrentUser()
    if (cognitoUser != null){
      cognitoUser.getSession(function(err, result) {
        if (!err) { 
          AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'eu-west-1:4137ce43-3a1e-47e1-b8e3-e264b55d66f1',
            Logins: {
              'cognito-idp.eu-west-1.amazonaws.com/eu-west-1_ESQzI4Jrf': result.getIdToken().getJwtToken()
            }
          }, {
            region: 'eu-west-1'
          });
        }
      });
    }

    var s3 = new AWS.S3({
      apiVersion: '2006-03-01',
      params: {Bucket: 'fotoschantal'}
    });
    
    // get folders
    s3.listObjects({Delimiter: '/'}, function(err, data) {
      if (err) {
        alert(err);
      } else {
        mythis.albums = data.CommonPrefixes;
      }
    });
  },
  computed: {
    chunkedImages() {
      return chunk(this.images, 6)
    }
  },
  methods: {
    listalbum: function (event) {
      // `event` is the native DOM event
      this.path = event.target.innerText;
      this.titleStack = [event.target.innerText];
      var mythis = this

      this.images = []
      var s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        params: {Bucket: "fotoschantal"}
      });

      // get files
      s3.listObjects({Prefix: event.target.innerText}, function(err, data) {
        if (err) {
          alert(err);
        } else {
          for (var i = 1; i < data.Contents.length; i++) {
            var myurl = s3.getSignedUrl('getObject', {
              Key: data.Contents[i].Key
            });
            mythis.images.push({'url': myurl, 'title':data.Contents[i].Key, 'size':data.Contents[i].Size});
          }
        }
      });
    }
  }
}
</script>
