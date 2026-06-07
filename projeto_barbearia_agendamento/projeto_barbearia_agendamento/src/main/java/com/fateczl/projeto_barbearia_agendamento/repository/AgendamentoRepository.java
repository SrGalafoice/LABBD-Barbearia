package com.fateczl.projeto_barbearia_agendamento.repository;

import com.fateczl.projeto_barbearia_agendamento.model.Agendamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {
    // Vincula diretamente com a Stored Procedure criada no MySQL (Requisito 7)
    @Procedure(procedureName = "SP_FaturamentoBarbeiro")
    java.math.BigDecimal calcularFaturamentoBarbeiro(@Param("p_id_barbeiro") Long idBarbeiro);
}