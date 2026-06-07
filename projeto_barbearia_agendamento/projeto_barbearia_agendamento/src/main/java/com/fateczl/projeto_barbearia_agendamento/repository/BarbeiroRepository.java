package com.fateczl.projeto_barbearia_agendamento.repository;

import com.fateczl.projeto_barbearia_agendamento.model.Barbeiro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BarbeiroRepository extends JpaRepository<Barbeiro, Long> {
}