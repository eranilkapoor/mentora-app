import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type OnlineMatch = {
  id: string;
  name: string;
  age: number;
  height: string;
  education: string;
  profession: string;
  city: string;
  photo: string;
  isOnline: boolean;
};

export default function OnlineMatchesScreen({ navigation }: any) {
  const [matches, setMatches] = useState<OnlineMatch[]>([]);

  useEffect(() => {
    fetchOnlineMatches();
  }, []);

  const fetchOnlineMatches = async () => {
    // Fake API
    setTimeout(() => {
      setMatches([
        {
          id: '1',
          name: 'Priya Sharma',
          age: 27,
          height: '5\'4"',
          education: 'MBA',
          profession: 'HR Manager',
          city: 'Delhi',
          photo: 'https://i.pravatar.cc/300?img=11',
          isOnline: true,
        },
        {
          id: '2',
          name: 'Ankit Verma',
          age: 30,
          height: '5\'9"',
          education: 'B.Tech',
          profession: 'Software Engineer',
          city: 'Bangalore',
          photo: 'https://i.pravatar.cc/300?img=12',
          isOnline: true,
        },
      ]);
    }, 600);
  };

  const renderItem = ({ item }: { item: OnlineMatch }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.photo }} style={styles.image} />

      {/* ONLINE BADGE */}
      {item.isOnline && (
        <View style={styles.onlineBadge}>
          <View style={styles.dot} />
          <Text style={styles.onlineText}>Online now</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.name}>
          {item.name}, {item.age}
        </Text>

        <Text style={styles.subText}>
          {item.height} • {item.education}
        </Text>

        <Text style={styles.subText}>
          {item.profession} • {item.city}
        </Text>

        {/* ACTION BUTTONS */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.chatBtn}
            onPress={() =>
              navigation.navigate('Chat', {
                partnerId: item.id,
                partnerName: item.name,
              })
            }
          >
            <Text style={styles.chatText}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() =>
              navigation.navigate('ProfileDetail', { userId: item.id })
            }
          >
            <Text style={styles.profileText}>View Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Online Matches</Text>

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    fontSize: 18,
    fontWeight: '700',
    padding: 16,
  },

  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },

  image: {
    width: '100%',
    height: 220,
  },

  onlineBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },

  onlineText: {
    color: '#fff',
    fontSize: 12,
  },

  info: {
    padding: 12,
  },

  name: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },

  subText: {
    color: '#555',
    fontSize: 13,
    marginBottom: 2,
  },

  actions: {
    flexDirection: 'row',
    marginTop: 10,
  },

  chatBtn: {
    backgroundColor: '#e53935',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
  },

  chatText: {
    color: '#fff',
    fontWeight: '600',
  },

  profileBtn: {
    borderWidth: 1,
    borderColor: '#e53935',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },

  profileText: {
    color: '#e53935',
    fontWeight: '600',
  },
});
