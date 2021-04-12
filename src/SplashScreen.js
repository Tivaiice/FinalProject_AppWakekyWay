/**
 *	Application splashscreen
 */

import React from 'react';
import { View, Image, ImageBackground, Text } from 'react-native';

import { AsyncStorage } from 'react-native';
import 'firebase/auth';
import 'firebase/firestore';

class Splash extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		setTimeout(() => {
			this.checkIfLoggedInGG();
		}, 2000);
	}
	
	async checkIfLoggedInGG(){
		let Keyuid;
		Keyuid = await AsyncStorage.getItem('Key');
		console.log('Welcome  :>> ', Keyuid);

		if (Keyuid == null) {
			this.props.navigation.navigate('Login')
		}
		else {
			this.props.navigation.navigate('Notification')
		}
	}
	
	render() {
		return (
			<View style={{ flex: 1, flexDirection : 'column'}}>   
				<ImageBackground 
					source={require('./images/BG1L.png')} 
					style={{flex: 1, resizeMode: "cover",justifyContent: "center"}}>
						<View style={{alignItems : 'center'}}>
							<Image
								source={require('./images/wakey-way.png')}
								style={{ width: '50%', height: '50%'}}
								resizeMode={'center'}
							/>
							<Text style={{fontSize : 12}}>Loading..</Text>
						</View>
				</ImageBackground>
			</View>
		)
	}
}

export default Splash;