package com.fateczl.projeto_barbearia_agendamento.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "clientes")
@Data
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_clientes")
    private Long id;

    @Column(nullable = false, length = 45)
    private String nome;

    @Column(nullable = false, length = 45)
    private String telefone;

    @Column(length = 45, unique = true)
    private String email;

    @Column(name = "data_cadastro", insertable = false, updatable = false)
    private LocalDateTime dataCadastro;
}