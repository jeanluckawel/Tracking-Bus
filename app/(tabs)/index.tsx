import React, { useState } from 'react';
import {
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';

NfcManager.start();

export default function EmployeeBadge() {
  const [employee, setEmployee] = useState(null);

  const scanCard = async () => {
    try {
      await NfcManager.cancelTechnologyRequest();
      await NfcManager.requestTechnology(NfcTech.MifareClassic);

      const tag = await NfcManager.getTag();
      const uidHex = tag?.id;
      if (!uidHex) return alert('UID non détecté');

      const uidDec = parseInt(uidHex, 16).toString();

      const response = await fetch(`https://zoomemoire.net/TrackingApi/public/${uidDec}`);
      const result = await response.json();

      if (result.status && result.data) {
        setEmployee(result.data);
      } else {
        alert("Employé introuvable.");
      }
    } catch (error) {
      console.warn(error);
      alert("Erreur NFC.");
    } finally {
      NfcManager.cancelTechnologyRequest();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button title="📲 Scanner carte NFC" onPress={scanCard} />

      {employee && (
        <View style={styles.badge}>
          <Text style={styles.header}>🏢 MON ENTREPRISE</Text>

          <View style={styles.row}>
            <Image
              source={{ uri: employee.photo || 'https://via.placeholder.com/100' }}
              style={styles.photo}
            />
            <View style={styles.infoBlock}>
              <Text style={styles.name}>
                {employee.EMP_FIRSTNAME} {employee.EMP_SURNAME}
              </Text>
              <Text style={styles.text}>🆔 Matricule : {employee.EMP_EMPNO}</Text>
              <Text style={styles.text}>💼 Fonction : {getTitle(employee.TITLE_CODEID)}</Text>
            </View>
          </View>

          <Text style={styles.text}>📇 ID : {employee.EMP_ID}</Text>
          <Text style={styles.text}>🎂 Né(e) le : {formatDate(employee.EMP_BIRTHDATE)}</Text>
          <Text style={styles.text}>🔑 UID NFC : {employee.tags?.[0]?.TAG_CODE}</Text>
        </View>
      )}
    </ScrollView>
  );
}

// Format "YYYY-MM-DD" → "DD/MM/YYYY"
const formatDate = (dateStr) => {
  if (!dateStr) return 'Non renseignée';
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${d.getFullYear()}`;
};

// Exemple simple de mappage des fonctions
const getTitle = (code) => {
  switch (code) {
    case 1:
      return 'Agent de sécurité';
    case 2:
      return 'Chef de site';
    default:
      return 'Fonction inconnue';
  }
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  badge: {
    marginTop: 30,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 15,
    width: '100%',
    elevation: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  header: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1d3557',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: '#ccc',
    marginRight: 15,
  },
  infoBlock: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2a2a2a',
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginVertical: 2,
  },
});
