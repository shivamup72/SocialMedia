import { StyleSheet, View, StatusBar, FlatList, ScrollView } from 'react-native';
import React, { useState } from 'react';
import CatchComponents from './Catch_up_components/CatchComponents';
import MiddleScreen from './MiddlehomeComponets/MiddleScreen';
import { RfH } from '../../../utils/helper';
// import HeaderComponents from './HeaderhomeComponents/Header';
// import CatchComponents from './Catch_up_components/CatchComponents';
// import MiddleScreen from './MiddlehomeComponets/MiddleScreen';

const HomeComponents = ({ navigation }) => {
  const [DataList, setDataList] = useState([]);
  const [Refresh, setRefresh] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: '#f9f9f9' }}>
      <StatusBar backgroundColor="#f9f9f9" barStyle="dark-content" />
      {/* <HeaderComponents
        navigation={navigation}
        DataListTask={DataList}
        Refresh={Refresh}
        setRefresh={setRefresh}
      /> */}
      <ScrollView contentContainerStyle={{ paddingBottom: RfH(80) }}>
        <CatchComponents
          navigation={navigation}
          DataListTask={DataList}
          Refresh={Refresh}
          setRefresh={setRefresh}
        />
        <MiddleScreen
          navigation={navigation}
          setDataList={setDataList}
          Refresh={Refresh}
          setRefresh={setRefresh}
        />
      </ScrollView>
    </View>
  );
};

export default HomeComponents;
