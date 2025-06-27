import React, { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager';

// Initialiser le gestionnaire NFC
function initNFC() {
  NfcManager.start()
    .then(() => console.log('NFC Ready'))
    .catch((err) => console.warn('Erreur init NFC:', err));
}

// Convertir un UID hexadécimal en décimal
function uidToDecimal(uidHex) {
  if (!uidHex) return '';
  try {
    return BigInt('0x' + uidHex).toString(10);
  } catch (e) {
    return 'Erreur de conversion';
  }
}

export default function App() {
  const [nfcData, setNfcData] = useState(null);

  useEffect(() => {
    initNFC();
    return () => NfcManager.stop();
  }, []);

  const scanTag = async () => {
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      setNfcData(tag);
      console.log('NFC TAG:', tag);

      if (tag.ndefMessage) {
        const message = tag.ndefMessage
          .map(record => Ndef.text.decodePayload(record.payload))
          .join('\n');
        Alert.alert('Message NFC', message);
      }
    } catch (err) {
      console.warn('Erreur NFC:', err);
    } finally {
      NfcManager.cancelTechnologyRequest();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lecteur NFC</Text>
      <Button title="Scanner une carte NFC" onPress={scanTag} />
      {nfcData && (
        <View style={styles.result}>
          <Text>UID (décimal) : {uidToDecimal(nfcData.id)}</Text>
          <Text>Type : {nfcData.type}</Text>
          <Text>Contenu brut : {JSON.stringify(nfcData)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  result: { marginTop: 30, backgroundColor: '#f0f0f0', padding: 10, borderRadius: 10 },
});
