<template>

<div id="login">
<!-- login form -->
<div id="lgform">  
 <v-form
    ref="form"
    v-model="valid"
    lazy-validation
  >
   <v-flex xs12>
    <v-text-field
      v-model="login.name"
      :rules="nameRules"
      label="Name"
      required
    ></v-text-field>
   </v-flex>

   <v-flex xs12>
    <v-text-field
            v-model="login.password"
            :append-icon="show1 ? 'visibility' : 'visibility_off'"
            :rules="[rules.required]"
            :type="show1 ?'text' : 'password'"
            label="Password"
            name="input-10-1"
            hint="At least 8 characters"
            counter
            @click:append="show1 = !show1"
          ></v-text-field>
   </v-flex>

    <v-btn
      :disabled="!valid"
      color="green"
      @click="loginUser"
    >
      Login
    </v-btn>

    <v-btn
      color="red"
      @click="reset"
    >
      Reset
    </v-btn>

    <v-btn color="orange" @click="registered">
     Register Now
    </v-btn>
  </v-form>

</div>

 <!-- registration form -->

  <v-layout row justify-center>
    <v-dialog v-model="dialog" persistent max-width="600px">
        <v-form
    ref="regform"
    v-model="regvalid"
    lazy-validation
  >
      <v-card>
        <v-card-title>
          <span class="headline">Registration Form</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12>
                <v-text-field
                  label="Legal username*"
                  v-model="register.name"
                  :rules="nameRules"
                  hint="Example: alice2019"
                  persistent-hint
                  required
                ></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field label="Email*" v-model="register.email"  :rules="emailRules" required></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field 
                label="Password*"
                v-model="register.password"
                :type="show1 ?'text' : 'password'" 
                :append-icon="show1 ? 'visibility' : 'visibility_off'" 
                :rules="[rules.required, rules.min]"
                hint="At least 8 characters"
                counter
                required
                @click:append="show1 = !show1"></v-text-field>
              </v-flex>
               <v-flex xs12>
                <v-text-field 
                label="Password Confirm*"
                v-model="register.passwordConfirm"
                :type="show1 ?'text' : 'password'" 
                :append-icon="show1 ? 'visibility' : 'visibility_off'" 
                :rules="[rules.required, rules.min]"
                :error-messages="passwordConfirmError()"
                counter
                required
                @click:append="show1 = !show1"></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
          <small>*indicates required field</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red darken-1" flat @click="dialog = false">Cancel</v-btn>
          <v-btn color="blue darken-1" flat @click="registerUser" :disabled="!regvalid">Register</v-btn>
        </v-card-actions>
      </v-card>
      </v-form>
    </v-dialog>
  </v-layout>
    


 <!-- notifications -->
 <notifications group="lgNotification" position="top center" :max="3" :width="500"/>
</div>

</template>

<script>

export default {
    data: () => ({
      valid: true,
      regvalid: true,
      nameRules: [
        v => !!v || 'Name is required',
      ], 
      emailRules: [
        v => !!v || 'E-mail is required',
        v => /.+@.+/.test(v) || 'E-mail must be valid'
      ],
      select: null,
      items: [
        'Item 1',
        'Item 2',
        'Item 3',
        'Item 4'
      ],
      checkbox: false,
      show1: false,
      rules: {
          required: value => !!value || 'Password is required.',
          min: v => v.length >= 8 || 'Min 8 characters',
          emailMatch: () => ('The email and password you entered don\'t match'),
        },
      passwordConfirmRules: [],
      dialog: false,
      login: {
        name: '',
        password: ''
      },
      register: {
        name: '',
        email: '',
        password: '',
        passwordConfirm: ''
      }
    }),

    methods: {
      loginUser () {
        if (this.$refs.form.validate()) {
          this.snackbar = true
           console.log(this.login.name + this.login.password)
        //validate user input
        axios
            .get("http://carabackend.local/login/", {
              params: {
                name: this.login.name,
                password: this.login.password
              }
            })
            .then(response => {
              // if successfully responsed, then add the new marker to the map
              console.log(response.data)
              if(response.data == false){
               console.log("please register first")
               this.$notify({
                 group: "lgNotification",
                 type: "warn",
                 title: "Dear Visitors,",
                 text: "Please register before usage!"
               });
              }
              else if(response.data == "the password matches"){
                console.log("successfully login")
                window.location.href = '/#';
                sessionStorage.setItem('user',this.login.name)
              }
              else if(response.data == "the wrong password"){
                console.log("please enter the right password")
                this.$notify({
                 group: "lgNotification",
                 type: "error",
                 title: "Dear User,",
                 text: "Please enter the right password!"
               });
              }
            })
            .catch(function(error) {
              console.log(error);
            })
            .then(function() {
              // always executed
            });
        }
      },
      reset () {
        this.$refs.form.reset()
      },
      passwordConfirmError(){
        return (this.register.password === this.register.passwordConfirm) ? '' : 'Password must match'

      },
      registered () {
        this.dialog = true;
      },
      registerUser(){
        console.log("the register username is :" + this.register.name)

        // register new users
        axios
            .get("http://carabackend.local/login/", {
              params: {
                username: this.register.name,
                email: this.register.email,
                password: this.register.password,
                register: true
              }
            })
            .then(response => {
              // if successfully responsed, then add the new marker to the map
              console.log(response.data)
               if(response.data == "the name has been used"){
                console.log("the name has been used")
               this.$notify({
                 group: "lgNotification",
                 type: "warn",
                 title: "Dear Visitor,",
                 text: "The username has been used!"
               });
              }
              else if(response.data == "register successfully"){
                console.log("register successfully")
                this.$notify({
                 group: "lgNotification",
                 type: "success",
                 title: "Dear User,",
                 text: "Congradulations! You register successfully."
               });
               this.dialog = false;
              }
            })
            .catch(function(error) {
              console.log(error);
            })
            .then(function() {
              // always executed
            });

      }
    },

  }

</script>

<style >

#lgform {
  position: absolute;
  top: 30%;
  left: 38%;

}

 

</style>