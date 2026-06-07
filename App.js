import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  StatusBar, 
  SafeAreaView, 
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';

const IP_MÁQUINA = '192.168.15.3';
const ACESSO_API = `http://${IP_MÁQUINA}:8080/api/agendamentos`; 

export default function App() {
  const [barbeiroRelatorio, setBarbeiroRelatorio] = useState(null);
  const [totalFaturado, setTotalFaturado] = useState(null);
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Listas vindas do Banco de Dados
  const [listaBarbeiros, setListaBarbeiros] = useState([]);
  const [listaClientes, setListaClientes] = useState([]);
  const [listaServicos, setListaServicos] = useState([]);

  // Estados selecionados no formulário
  const [barbeiroSelecionado, setBarbeiroSelecionado] = useState(null);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [servicoSelecionado, setServicoSelecionado] = useState(null);
  const [valorAutomatico, setValorAutomatico] = useState(0); // Captura o valor do banco

  const [statusInput, setStatusInput] = useState('AGENDADO');

  useEffect(() => {
    buscarDadosIniciais();
  }, []);

  const consultarFaturamento = async (idBarbeiro) => {
    try {
      setBarbeiroRelatorio(idBarbeiro);
      const response = await fetch(`${ACESSO_API}/relatorio/faturamento/${idBarbeiro}`);
      if (response.ok) {
        const resultado = await response.json();
        if (resultado && resultado.totalFaturado !== undefined) {
          setTotalFaturado(resultado.totalFaturado);
        } else {
          setTotalFaturado(0);
        }
      } else {
        setTotalFaturado(0);
      }
    } catch (err) {
      Alert.alert('Erro', 'Falha ao buscar relatório da Procedure.');
    }
  };

  const buscarDadosIniciais = async () => {
    try {
      setCarregando(true);
      setErro(null);

      const resAgendamentos = await fetch(ACESSO_API);
      if (resAgendamentos.ok) setAgendamentos(await resAgendamentos.json());

      const resBarbeiros = await fetch(`${ACESSO_API}/barbeiros`);
      if (resBarbeiros.ok) setListaBarbeiros(await resBarbeiros.json());

      const resClientes = await fetch(`${ACESSO_API}/clientes`);
      if (resClientes.ok) setListaClientes(await resClientes.json());

      const resServicos = await fetch(`${ACESSO_API}/servicos`);
      if (resServicos.ok) setListaServicos(await resServicos.json());

    } catch (err) {
      console.error(err);
      setErro('Não foi possível conectar ao ecossistema Java.');
    } finally {
      setCarregando(false);
    }
  };

  // Função disparada ao selecionar um serviço
  const selecionarServicoComValor = (servico) => {
    const idServ = servico.id_serviços || servico.id;
    const preco = servico.preco || 0;
    
    setServicoSelecionado(idServ);
    setValorAutomatico(preco); // Define o valor automaticamente sem digitação!
  };

  const cadastrarAgendamento = async () => {
    if (!barbeiroSelecionado || !clienteSelecionado || !servicoSelecionado) {
      Alert.alert('Atenção', 'Por favor, selecione o Cliente, Barbeiro e Serviço!');
      return;
    }

    const novoAgendamento = {
      dataHora: new Date().toISOString(),
      status: statusInput.toUpperCase(),
      valorPago: parseFloat(valorAutomatico), // Enviando o valor automático do serviço
      cliente: { id: clienteSelecionado },
      barbeiro: { id: barbeiroSelecionado },
      servico: { id: servicoSelecionado }
    };

    try {
      const response = await fetch(ACESSO_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoAgendamento)
      });

      if (response.ok) {
        Alert.alert('Sucesso', 'Agendamento registrado com sucesso!');
        setBarbeiroSelecionado(null);
        setClienteSelecionado(null);
        setServicoSelecionado(null);
        setValorAutomatico(0);
        buscarDadosIniciais(); 
      } else {
        const textoErro = await response.text();
        Alert.alert('Erro no Servidor', textoErro);
      }
    } catch (err) {
      Alert.alert('Erro', 'Falha na rede.');
    }
  };

  const alterarStatus = async (id, statusAtual) => {
    const novoStatus = statusAtual === 'CONFIRMADO' ? 'FINALIZADO' : 'CONFIRMADO';
    // Na alteração de status, mantemos o valor padrão ou o que já estava
    const dadosAtualizados = { dataHora: new Date().toISOString(), status: novoStatus, valorPago: 60.00 };
    try {
      const response = await fetch(`${ACESSO_API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosAtualizados)
      });
      if (response.ok) buscarDadosIniciais();
    } catch (err) {
      Alert.alert('Erro', 'Falha de conexão.');
    }
  };

  const deletarAgendamento = async (id) => {
    Alert.alert('Confirmar Exclusão', 'Deseja remover este agendamento?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
          try {
            const response = await fetch(`${ACESSO_API}/${id}`, { method: 'DELETE' });
            if (response.ok) buscarDadosIniciais();
          } catch (err) { Alert.alert('Erro', 'Falha de conexão.'); }
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Barbearia Imperial</Text>
        <Text style={styles.headerSubtitle}>Agendamentos Dinâmicos</Text>
      </View>

      <ScrollView contentContainerStyle={styles.listContent} keyboardShouldPersistTaps="handled">
        
        {/* 📊 BLOCO: RELATÓRIO E STORED PROCEDURE */}
        <View style={styles.formulario}>
          <Text style={styles.formTitle}>📊 Relatório de Faturamento</Text>
          <Text style={styles.seletorLabel}>Toque no Barbeiro para calcular:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rowSeletores}>
            {listaBarbeiros.map((b) => {
              const idBarb = b.id_barbeiros || b.id;
              return (
                <TouchableOpacity 
                  key={`rep-${idBarb}`}
                  style={[styles.seletorBotao, barbeiroRelatorio === idBarb && { borderColor: '#00ff88' }]}
                  onPress={() => consultarFaturamento(idBarb)}
                >
                  <Text style={[styles.seletorTexto, barbeiroRelatorio === idBarb && { color: '#00ff88' }]}>{b.nome}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          
          {totalFaturado !== null && (
            <View style={{ backgroundColor: '#121212', padding: 10, borderRadius: 5, marginBottom: 15, borderWidth: 1, borderColor: '#333' }}>
              <Text style={{ color: '#aaa', fontSize: 12 }}>TOTAL ARRECADADO NO BANCO:</Text>
              <Text style={{ color: '#00ff88', fontSize: 20, fontWeight: 'bold' }}>R$ {Number(totalFaturado).toFixed(2)}</Text>
            </View>
          )}

          <View style={{ height: 1, backgroundColor: '#333', marginVertical: 15 }} />

          <Text style={styles.formTitle}>Novo Agendamento Real</Text>

          {/* SELEÇÃO DE CLIENTE */}
          <Text style={styles.seletorLabel}>Selecione o Cliente:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rowSeletores}>
            {listaClientes.map((c) => {
              const idCli = c.id_cliente || c.id;
              return (
                <TouchableOpacity 
                  key={String(idCli)}
                  style={[styles.seletorBotao, clienteSelecionado === idCli && styles.seletorAtivo]}
                  onPress={() => setClienteSelecionado(idCli)}
                >
                  <Text style={[styles.seletorTexto, clienteSelecionado === idCli && styles.seletorTextoAtivo]}>{c.nome}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* SELEÇÃO DE BARBEIRO */}
          <Text style={styles.seletorLabel}>Selecione o Barbeiro:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rowSeletores}>
            {listaBarbeiros.map((b) => {
              const idBarb = b.id_barbeiros || b.id;
              return (
                <TouchableOpacity 
                  key={String(idBarb)}
                  style={[styles.seletorBotao, barbeiroSelecionado === idBarb && styles.seletorAtivo]}
                  onPress={() => setBarbeiroSelecionado(idBarb)}
                >
                  <Text style={[styles.seletorTexto, barbeiroSelecionado === idBarb && styles.seletorTextoAtivo]}>{b.nome}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* SELEÇÃO DE SERVIÇO */}
          <Text style={styles.seletorLabel}>Selecione o Serviço:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rowSeletores}>
            {listaServicos.map((s) => {
              const idServ = s.id_serviços || s.id;
              return (
                <TouchableOpacity 
                  key={String(idServ)}
                  style={[styles.seletorBotao, servicoSelecionado === idServ && styles.seletorAtivo]}
                  onPress={() => selecionarServicoComValor(s)}
                >
                  <Text style={[styles.seletorTexto, servicoSelecionado === idServ && styles.seletorTextoAtivo]}>
                    {s.nome_serviço || s.nomeServico} (R$ {Number(s.preco).toFixed(2)})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* EXIBIÇÃO DINÂMICA DO PREÇO DO BANCO */}
          {servicoSelecionado && (
            <View style={{ backgroundColor: '#121212', padding: 8, borderRadius: 5, marginVertical: 10, alignItems: 'center' }}>
              <Text style={{ color: '#888', fontSize: 11 }}>VALOR DO SERVIÇO SELECIONADO</Text>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>R$ {Number(valorAutomatico).toFixed(2)}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.botaoCadastrar} onPress={cadastrarAgendamento}>
            <Text style={styles.botaoTextoCadastrar}>RESERVAR AGENDAMENTO</Text>
          </TouchableOpacity>
        </View>

        {/* LISTAGEM GERAL */}
        <Text style={[styles.formTitle, { textAlign: 'left', marginHorizontal: 16, marginTop: 10 }]}>📋 Todos os Agendamentos</Text>

        {carregando ? (
          <ActivityIndicator size="large" color="#d4af37" style={{ marginTop: 20 }} />
        ) : erro ? (
          <View style={styles.centerContainerFallback}>
            <Text style={styles.errorText}>{erro}</Text>
            <TouchableOpacity style={styles.botaoRecarregar} onPress={buscarDadosIniciais}>
              <Text style={styles.botaoText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        ) : agendamentos.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum agendamento encontrado.</Text>
        ) : (
          agendamentos.map((item, index) => {
            const dataFormatada = new Date(item.dataHora).toLocaleString('pt-BR');
            const idAgendamento = item.id_agendamento || item.idAgendamento || item.id || index;
            const statusAgendamento = item.status || 'AGENDADO';
            const valor = item.valor_pago || item.valorPago || 0;

            return (
              <View key={String(idAgendamento)} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardId}>Agendamento #{idAgendamento}</Text>
                  <TouchableOpacity style={styles.statusBadge} onPress={() => alterarStatus(idAgendamento, statusAgendamento)}>
                    <Text style={styles.statusText}>{statusAgendamento} 🔄</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.infoLabel}>Profissional / Cliente:</Text>
                <Text style={styles.infoValue}>
                  💈 {item.barbeiro?.nome || 'N/A'} | 👤 {item.cliente?.nome || 'N/A'}
                </Text>
                <Text style={styles.infoLabel}>Data e Serviço:</Text>
                <Text style={styles.infoValue}>{dataFormatada} - {item.servico?.nome_serviço || item.servico?.nomeServico || 'Serviço'}</Text>
                
                <View style={styles.priceContainer}>
                  <Text style={styles.priceValue}>R$ {Number(valor).toFixed(2)}</Text>
                  <TouchableOpacity style={styles.botaoDeletar} onPress={() => deletarAgendamento(idAgendamento)}>
                    <Text style={styles.textoBotaoDeletar}>Excluir 🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#222', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#d4af37', letterSpacing: 1 },
  headerSubtitle: { fontSize: 12, color: '#888', marginTop: 2 },
  formulario: { backgroundColor: '#1e1e1e', padding: 15, margin: 16, borderRadius: 8, borderWidth: 1, borderColor: '#333', marginBottom: 5 },
  formTitle: { fontWeight: 'bold', marginBottom: 10, fontSize: 15, color: '#d4af37', textAlign: 'center' },
  seletorLabel: { color: '#aaa', fontSize: 12, fontWeight: 'bold', marginBottom: 6, textTransform: 'uppercase' },
  rowSeletores: { flexDirection: 'row', marginBottom: 12 },
  seletorBotao: { backgroundColor: '#121212', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#444' },
  seletorAtivo: { borderColor: '#d4af37', backgroundColor: 'rgba(212, 175, 55, 0.1)' },
  seletorTexto: { color: '#888', fontSize: 13, fontWeight: '500' },
  seletorTextoAtivo: { color: '#d4af37', fontWeight: 'bold' },
  botaoCadastrar: { backgroundColor: '#d4af37', padding: 12, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  botaoTextoCadastrar: { color: '#121212', fontWeight: 'bold', fontSize: 13 },
  listContent: { paddingBottom: 30 },
  card: { backgroundColor: '#1e1e1e', borderRadius: 8, padding: 14, marginHorizontal: 16, marginTop: 12, borderWidth: 1, borderColor: '#333' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardId: { color: '#fff', fontWeight: 'bold' },
  statusBadge: { backgroundColor: 'rgba(212, 175, 55, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#d4af37' },
  statusText: { color: '#d4af37', fontSize: 11, fontWeight: 'bold' },
  infoLabel: { color: '#555', fontSize: 11, textTransform: 'uppercase', marginTop: 4 },
  infoValue: { color: '#ccc', fontSize: 14, marginBottom: 4 },
  priceContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  priceValue: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  botaoDeletar: { backgroundColor: '#cc3333', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 4 },
  textoBotaoDeletar: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  centerContainerFallback: { alignItems: 'center', marginTop: 20 },
  errorText: { color: '#ff5252', marginBottom: 10 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 20 },
  botaoRecarregar: { backgroundColor: '#d4af37', padding: 10, borderRadius: 5 },
  botaoText: { color: '#121212', fontWeight: 'bold' }
});