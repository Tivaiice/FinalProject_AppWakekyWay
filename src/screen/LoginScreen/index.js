
import * as React from "react";
import {
  Text,
  StyleSheet,
  View,
  ImageBackground,
  TouchableOpacity,
  Image,
} from "react-native";

import 'firebase/auth';
import 'firebase/firestore';

const Login = (props) => {
    return (
      <View style={{ flex: 1}}>
        <View style={{ flex: 1 , backgroundColor: "#FFD428" }}>
          <ImageBackground 
            source={require('../../images/BGLogin.png')} 
            style={styles.Background}>
              <Image
                  source={require('../../images/logowakeyways-new2.png')}
                  style={{width : 200, height : 65 , marginLeft : 35}}
                 resizeMode={'contain'}
              />
          </ImageBackground>
        </View>
        <View style={{ flex: 2, backgroundColor : '#F2FFFE'}}>
          <View style={{marginTop : Platform.OS === 'ios'?'-30%':'-25%'}}>
            <View style={{ height : 250 ,backgroundColor : '#FFFFFF', margin : 30, borderRadius : 20}}>
            <View style={{alignItems : 'center', marginTop : 55}}>
              <Text style={{fontFamily:'PromptLight', fontSize: 30}}>Join Us Now</Text>
            </View>
            <View style={{ marginTop : '5%', alignItems:'center'}}>
              <TouchableOpacity 
                style={styles.btnGoogle}
                onPress={() => {
                  props.setsignInGoogleAsync()
                }}
              >   
                <View style={{flexDirection:'row',justifyContent:'center'}}>
                  <View style={{paddingVertical : 5, marginLeft : -15}}>
                    <View style={styles.boximageGG}>
                      <Image 
                        style={styles.imageGG}
                        source={require('../../images/google-logo.png')} 
                      />
                    </View>
                  </View>
                    <Text style={styles.txtGG}>Sign in with Google</Text>
                  </View>
              </TouchableOpacity>
            </View>
          </View>
          </View>
        </View>
      </View>
    );
}

const styles = StyleSheet.create({
  Background: {
    flex: 1, 
    resizeMode: "cover",
    justifyContent: "center"
  }
  ,
  btnGoogle: {
    height: 60,
    width : 270,
    borderRadius:10,
    backgroundColor : '#242A37',
  },
  boximageGG:{
    width : 47, 
    height : 47,
    backgroundColor : '#FFFFFF', 
    justifyContent : 'center', 
    alignItems :'center', 
    borderRadius : 7,
    marginRight : 15,
    marginTop : '2%'
  },
  imageGG: {
    width: '50%', 
    height: '50%',
  },
  txtGG: {
    fontFamily:'PromptRegular', 
    fontSize: 18,
    marginTop:10,
    margin:7,
    alignSelf:'center',
    color:'#FFFFFF',
  }
})

export default Login;
