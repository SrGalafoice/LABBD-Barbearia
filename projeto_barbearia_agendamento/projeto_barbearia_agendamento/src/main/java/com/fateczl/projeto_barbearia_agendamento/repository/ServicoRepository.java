package com.fateczl.projeto_barbearia_agendamento.repository;

import com.fateczl.projeto_barbearia_agendamento.model.Servico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServicoRepository extends JpaRepository<Servico, Long> {
}