<template>

<div id="login">

<div id="lgform">
 <v-form
    ref="form"
    v-model="valid"
    lazy-validation
  >
   <v-flex xs12>
    <v-text-field
      v-model="name"
      :counter="10"
      :rules="nameRules"
      label="Name"
      required
    ></v-text-field>
   </v-flex>
   
   <v-flex xs12>
    <v-text-field
      v-model="email"
      :rules="emailRules"
      label="E-mail"
      required
    ></v-text-field>
   </v-flex>

   <v-flex xs12>
    <v-text-field
            v-model="password"
            :append-icon="show1 ? 'visibility' : 'visibility_off'"
            :rules="[rules.required, rules.min]"
            :type="show1 ? 'text' : 'password'"
            label="Password"
            name="input-10-1"
            hint="At least 8 characters"
            counter
            @click:append="show1 = !show1"
          ></v-text-field>
   </v-flex>

  <!-- <v-flex xs12>
    <v-select
      v-model="select"
      :items="items"
      :rules="[v => !!v || 'Item is required']"
      label="Item"
      required
      attach="true"
    ></v-select>
  </v-flex> -->


    <v-checkbox
      v-model="checkbox"
      :rules="[v => !!v || 'You must agree to continue!']"
      label="Do you agree?"
      required
    ></v-checkbox>

    <v-btn
      :disabled="!valid"
      color="green"
      @click="validate"
    >
      Login
    </v-btn>

    <v-btn
      color="red"
      @click="reset"
    >
      Reset
    </v-btn>

    <v-btn color="orange" @click="resetValidation">
     Reset Validation
    </v-btn>
  </v-form>

</div>
</div>

</template>

<script>

export default {
    data: () => ({
      valid: true,
      name: '',
      nameRules: [
        v => !!v || 'Name is required',
        v => (v && v.length <= 10) || 'Name must be less than 10 characters'
      ],
      email: '',
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
      password: 'Password',
      rules: {
          required: value => !!value || 'Password is required.',
          min: v => v.length >= 8 || 'Min 8 characters',
          emailMatch: () => ('The email and password you entered don\'t match')
        }
    }),

    methods: {
      validate () {
        if (this.$refs.form.validate()) {
          this.snackbar = true
          alert(this.name + this.password)
          
        

        //validate user input
        axios
            .get("http://carabackend.local/login/", {
              params: {
                name: this.name,
                password: this.password
              }
            })
            .then(response => {
              // if successfully responsed, then add the new marker to the map
              console.log(response.data)
              if(response.data == false){
                alert("please register first")
              }
              else if(response.data == "the password matches"){
                alert("successfully login")
                window.location.href = '/#';
                sessionStorage.setItem('user',this.name)
              }
              else if(response.data == "the wrong password"){
                alert("please enter the right password")
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
      resetValidation () {
        this.$refs.form.resetValidation()
      }
    }
  }

</script>

<style >

#lgform {
  position: absolute;
  top: 30%;
  left: 38%;

}

 

</style>