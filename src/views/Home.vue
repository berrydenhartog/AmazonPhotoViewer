<template>
  <div class="home">
    <nav class="breadcrumb">
      <div class="buttons">
        <b-button type="is-light" @click="listalbum2" v-for="(title,index) in titleStack" :key="index">
        {{ title }}
        </b-button>
      </div>
    </nav>
    <div class="buttons">
      <b-button type="is-light"  @click="listalbum" v-for="(title,index) in albums" :key="index">
        {{ title.Prefix }}
      </b-button>
    </div>
    <div class="section">
        <div v-for="images in chunkedImages"  v-bind:key="images.index" class="columns">
          <div v-for="image in images" v-bind:key="image.index" class="column is-2">
            <figure class="image">
              <img @click="loadFull" v-bind:src="image.url" :alt="image.title">
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
      params: {Bucket: 'fotoschantal-resized'}
    });
    
    // get folders
    s3.listObjects({Delimiter: '/'}, function(err, data) {
      if (err) {
        alert(err);
      } else {
        mythis.albums = data.CommonPrefixes;
        for (var i = 1; i < data.Contents.length; i++) {
          var myurl = s3.getSignedUrl('getObject', {
            Key: data.Contents[i].Key
          });
          mythis.images.push({'url': myurl, 'title':data.Contents[i].Key, 'size':data.Contents[i].Size});
        }
      }
    });
  },
  computed: {
    chunkedImages() {
      return chunk(this.images, 6)
    }
  },
  methods: {
    loadFull: function (event) {
      console.log(event.target.alt)

      var s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        params: {Bucket: "fotoschantal"}
      });
      var myurl = s3.getSignedUrl('getObject', {
        Key: event.target.alt
      });
      window.open(myurl, '_blank');
    },
    listalbum2: function (event) {
      var mythis = this;
      this.titleStack.shift()
      var searchpath = ""
      if (event.target.innerText !== "/") {
        for (var i = 0; i < this.titleStack.length; i++) { 
          if ( i == 0 ) {
            searchpath = this.titleStack[i]
          } else {
            searchpath = searchpath+"/"+this.titleStack[i];
          }
          if (this.titleStack[i] == event.target.innerText) {
            searchpath = searchpath + "/"
            break;
          }
        }
      }
 

      this.titleStack = ["/"];
      this.titleStack = this.titleStack.concat(searchpath.split('/'));
      this.titleStack.pop()

      this.images = []
      var s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        params: {Bucket: "fotoschantal-resized"}
      });

          // get folders
      s3.listObjects({Delimiter: "/",Prefix: searchpath}, function(err, data) {
        if (err) {
          alert(err);
        } else {
          // get album and strip prefix
          mythis.albums = data.CommonPrefixes;

          for (var i = 0; i < mythis.albums.length; i++) {
            mythis.albums[i].Prefix = mythis.albums[i].Prefix.replace(data.Prefix,'')
          }

          // get images
          for (var i = 0; i < data.Contents.length; i++) {
            var myurl = s3.getSignedUrl('getObject', {
              Key: data.Contents[i].Key
            });
            mythis.images.push({'url': myurl, 'title':data.Contents[i].Key, 'size':data.Contents[i].Size});
          }
        }
      });
    },
    listalbum: function (event) {
      // `event` is the native DOM event
      var mythis = this;
      this.titleStack.shift()
      var searchpath = ""
      if (this.titleStack.length < 1) {
        var searchpath = event.target.innerText;
      } else {
        var searchpath = this.titleStack.join("/")+"/"+event.target.innerText;
      }

      this.titleStack = ["/"];
      this.titleStack = this.titleStack.concat(searchpath.split('/'));
      this.titleStack.pop()

      this.images = []
      var s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        params: {Bucket: "fotoschantal-resized"}
      });

          // get folders
      s3.listObjects({Delimiter: "/",Prefix: searchpath}, function(err, data) {
        if (err) {
          alert(err);
        } else {
          // get album and strip prefix
          mythis.albums = data.CommonPrefixes;

          for (var i = 0; i < mythis.albums.length; i++) {
            mythis.albums[i].Prefix = mythis.albums[i].Prefix.replace(data.Prefix,'')
          }

          // get images
          for (var i = 0; i < data.Contents.length; i++) {
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
