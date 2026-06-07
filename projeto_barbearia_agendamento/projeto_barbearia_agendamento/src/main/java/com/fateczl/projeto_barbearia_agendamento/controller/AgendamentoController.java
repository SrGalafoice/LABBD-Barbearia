package com.fateczl.projeto_barbearia_agendamento.controller;

import com.fateczl.projeto_barbearia_agendamento.model.Agendamento;
import com.fateczl.projeto_barbearia_agendamento.repository.AgendamentoRepository;
import com.fateczl.projeto_barbearia_agendamento.repository.BarbeiroRepository;
import com.fateczl.projeto_barbearia_agendamento.repository.ClienteRepository;
import com.fateczl.projeto_barbearia_agendamento.repository.ServicoRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agendamentos")
@CrossOrigin(origins = "*") // Libera o acesso para o Flutter
public class AgendamentoController {

    @Autowired
    private AgendamentoRepository agendamentoRepository;

    //linhas para o Controller conseguir consultar as outras tabelas
    @Autowired
    private ClienteRepository clienteRepository;
    @Autowired
    private BarbeiroRepository barbeiroRepository;
    @Autowired
    private ServicoRepository servicoRepository;


    // 1. READ (Listar todos)
    @GetMapping
    public List<Agendamento> listarTodos() {
        return agendamentoRepository.findAll();
    }

    // 2. CREATE (Salvar novo)
    @PostMapping
    public ResponseEntity<?> salvar(@RequestBody Agendamento agendamento) {
        try {
            // 1. Buscamos o Cliente real no banco
            if (agendamento.getCliente() != null && agendamento.getCliente().getId() != null) {
                agendamento.setCliente(clienteRepository.findById(agendamento.getCliente().getId()).orElse(null));
            }
            // 2. Buscamos o Barbeiro real no banco
            if (agendamento.getBarbeiro() != null && agendamento.getBarbeiro().getId() != null) {
                agendamento.setBarbeiro(barbeiroRepository.findById(agendamento.getBarbeiro().getId()).orElse(null));
            }
            // 3. Buscamos o Serviço real no banco
            if (agendamento.getServico() != null && agendamento.getServico().getId() != null) {
                com.fateczl.projeto_barbearia_agendamento.model.Servico servicoBanco = 
                    servicoRepository.findById(agendamento.getServico().getId()).orElse(null);
                
                agendamento.setServico(servicoBanco);

                // Se encontramos o serviço no banco, blindamos o sistema
                // garantindo que o valor_pago seja EXATAMENTE o valor real do serviço cadastrado!
                if (servicoBanco != null) {
                    agendamento.setValorPago(servicoBanco.getPreco());
                }
            }

            // Se mesmo assim o valor ficou nulo por alguma falha de envio, definimos zero por segurança
            if (agendamento.getValorPago() == null) {
                agendamento.setValorPago(java.math.BigDecimal.ZERO);
            }

            // Agora o Hibernate sabe que são registros existentes e salvará o preço correto
            Agendamento salvo = agendamentoRepository.save(agendamento);
            return ResponseEntity.ok(salvo);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao salvar no banco: " + e.getMessage());
        }
    }

    // 3. UPDATE (Atualizar agendamento existente)
    @PutMapping("/{id}")
    public ResponseEntity<Agendamento> atualizar(@PathVariable Long id, @RequestBody Agendamento agendamentoAtualizado) {
        return agendamentoRepository.findById(id)
                .map(agendamento -> {
                    agendamento.setDataHora(agendamentoAtualizado.getDataHora());
                    agendamento.setStatus(agendamentoAtualizado.getStatus());
                    agendamento.setValorPago(agendamentoAtualizado.getValorPago());

                    // Atualiza também os relacionamentos caso venham no JSON
                    if (agendamentoAtualizado.getCliente() != null) agendamento.setCliente(agendamentoAtualizado.getCliente());
                    if (agendamentoAtualizado.getBarbeiro() != null) agendamento.setBarbeiro(agendamentoAtualizado.getBarbeiro());
                    if (agendamentoAtualizado.getServico() != null) agendamento.setServico(agendamentoAtualizado.getServico());

                    Agendamento salvo = agendamentoRepository.save(agendamento);
                    return ResponseEntity.ok(salvo);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 4. DELETE (Excluir agendamento)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (agendamentoRepository.existsById(id)) {
            agendamentoRepository.deleteById(id);
            return ResponseEntity.noContent().build(); // Retorna 24 No Content (sucesso)
        }
        return ResponseEntity.notFound().build(); // Retorna 404 se o ID não existir
    }

    // Endpoint para listar os barbeiros no formulário do celular
    @GetMapping("/barbeiros")
    public List<com.fateczl.projeto_barbearia_agendamento.model.Barbeiro> listarBarbeiros() {
        return barbeiroRepository.findAll();
    }

    // Endpoint para listar os clientes no formulário do celular
    @GetMapping("/clientes")
    public List<com.fateczl.projeto_barbearia_agendamento.model.Cliente> listarClientes() {
        return clienteRepository.findAll();
    }

    // Endpoint para listar os serviços no formulário do celular
    @GetMapping("/servicos")
    public List<com.fateczl.projeto_barbearia_agendamento.model.Servico> listarServicos() {
        return servicoRepository.findAll();
    }

    // 6 e 7. RELATÓRIO VIA STORED PROCEDURE
    @GetMapping("/relatorio/faturamento/{idBarbeiro}")
    public ResponseEntity<?> obterFaturamentoBarbeiro(@PathVariable Long idBarbeiro) {
        try {
            // Dispara a Stored Procedure do MySQL através do Repository
            java.math.BigDecimal total = agendamentoRepository.calcularFaturamentoBarbeiro(idBarbeiro);
            
            // Retorna um JSON simples com o resultado para o celular
            java.util.Map<String, Object> resposta = new java.util.HashMap<>();
            resposta.put("idBarbeiro", idBarbeiro);
            resposta.put("totalFaturado", total);
            
            return ResponseEntity.ok(resposta);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro na Procedure: " + e.getMessage());
        }
    }
}