import {
  entityFieldSqlName,
  type EntityFieldSchema,
  type EntityFieldType,
  type VireoEntitySchema,
} from "./entity-schema.js";

export type GeneratedFile = {
  path: string;
  content: string;
  ownership: "generated-once" | "regenerated";
  role: "backend" | "contract" | "documentation" | "frontend" | "migration" | "registry" | "test";
};

export type VireoProjectMetadata = {
  schemaVersion: number;
  profile?: "frontend" | "full-stack";
  projectName: string;
  javaPackage?: string;
  database?: string;
  packageManager?: string;
};

export type VireoGenerationTarget = "frontend" | "full-stack";

export type WireContract = {
  schemaVersion: 1;
  entity: string;
  id: { name: "id"; type: "long"; wireType: "integer" };
  fields: Array<{
    name: string;
    type: EntityFieldType;
    wireType: "boolean" | "integer" | "number" | "string";
    nullable: boolean;
    enumValues?: string[];
    constraints?: EntityFieldSchema["constraints"];
  }>;
  endpoints: {
    search: { method: "POST"; path: string; response: "page" };
    create: { method: "POST"; path: string };
    update: { method: "PUT"; path: string };
    delete: { method: "DELETE"; path: string };
  };
  semantics: {
    date: "ISO-8601 calendar date";
    decimal:
      | "JSON number; BigDecimal is canonical on the server"
      | "JSON number by default; the application adapter owns precision-sensitive transport mapping";
    errors:
      | "Spring ProblemDetail with field violations when validation fails"
      | "The application adapter normalizes backend-specific failures into frontend errors";
    nullability: "optional fields are explicit JSON null; unknown response fields are stripped by Zod";
    timestamp: "ISO-8601 UTC or offset timestamp";
  };
};

export type EntityNames = {
  className: string;
  constant: string;
  fileStem: string;
  packageName: string;
  packagePath: string;
  pageClass: string;
  plural: string;
  routeId: string;
};

function lowerFirst(value: string) {
  return `${value[0].toLocaleLowerCase("en-US")}${value.slice(1)}`;
}

function upperSnake(value: string) {
  return value.replace(/([a-z0-9])([A-Z])/gu, "$1_$2").toLocaleUpperCase("en-US");
}

function upperFirst(value: string) {
  return `${value[0].toLocaleUpperCase("en-US")}${value.slice(1)}`;
}

export function entityNames(schema: VireoEntitySchema, project: VireoProjectMetadata): EntityNames {
  const className = schema.entity.name;
  const fileStem = lowerFirst(className);
  return {
    className,
    constant: upperSnake(className),
    fileStem,
    packageName: `${project.javaPackage ?? "dev.vireo.frontend"}.app.${fileStem.toLocaleLowerCase("en-US")}`,
    packagePath: `${(project.javaPackage ?? "dev.vireo.frontend").replaceAll(".", "/")}/app/${fileStem.toLocaleLowerCase("en-US")}`,
    pageClass: `AppPage${schema.entity.plural
      .split("-")
      .map(part => `${part[0].toLocaleUpperCase("en-US")}${part.slice(1)}`)
      .join("")}`,
    plural: schema.entity.plural,
    routeId: schema.entity.plural.replace(/-([a-z])/gu, (_, letter: string) => letter.toLocaleUpperCase("en-US")),
  };
}

function wireType(type: EntityFieldType): WireContract["fields"][number]["wireType"] {
  if (type === "boolean") return "boolean";
  if (type === "integer" || type === "long") return "integer";
  if (type === "decimal") return "number";
  return "string";
}

export function createWireContract(
  schema: VireoEntitySchema,
  target: VireoGenerationTarget = "full-stack",
): WireContract {
  return {
    schemaVersion: 1,
    entity: schema.entity.name,
    id: { name: "id", type: "long", wireType: "integer" },
    fields: schema.fields.map(field => ({
      name: field.name,
      type: field.type,
      wireType: wireType(field.type),
      nullable: field.required !== true,
      ...(field.enumValues ? { enumValues: field.enumValues } : {}),
      ...(field.constraints ? { constraints: field.constraints } : {}),
    })),
    endpoints: {
      search: { method: "POST", path: `${schema.api.path}/search`, response: "page" },
      create: { method: "POST", path: schema.api.path },
      update: { method: "PUT", path: `${schema.api.path}/{id}` },
      delete: { method: "DELETE", path: `${schema.api.path}/{id}` },
    },
    semantics: {
      date: "ISO-8601 calendar date",
      decimal:
        target === "full-stack"
          ? "JSON number; BigDecimal is canonical on the server"
          : "JSON number by default; the application adapter owns precision-sensitive transport mapping",
      errors:
        target === "full-stack"
          ? "Spring ProblemDetail with field violations when validation fails"
          : "The application adapter normalizes backend-specific failures into frontend errors",
      nullability: "optional fields are explicit JSON null; unknown response fields are stripped by Zod",
      timestamp: "ISO-8601 UTC or offset timestamp",
    },
  };
}

function generatedHeader(comment: "//" | "--", schemaDigest: string, ownership: GeneratedFile["ownership"]) {
  return `${comment} @vireo-${ownership} schema-v1 digest:${schemaDigest}\n`;
}

function javaType(field: EntityFieldSchema) {
  const types: Record<EntityFieldType, string> = {
    boolean: "Boolean",
    date: "LocalDate",
    decimal: "BigDecimal",
    enum: upperFirst(field.name),
    integer: "Integer",
    long: "Long",
    string: "String",
    text: "String",
    timestamp: "Instant",
    uuid: "UUID",
  };
  return types[field.type];
}

function javaImports(fields: EntityFieldSchema[]) {
  const imports = new Set<string>();
  if (fields.some(field => field.type === "decimal")) imports.add("java.math.BigDecimal");
  if (fields.some(field => field.type === "date")) imports.add("java.time.LocalDate");
  if (fields.some(field => field.type === "timestamp")) imports.add("java.time.Instant");
  if (fields.some(field => field.type === "uuid")) imports.add("java.util.UUID");
  return [...imports]
    .sort()
    .map(value => `import ${value};`)
    .join("\n");
}

function javaValidation(field: EntityFieldSchema) {
  const annotations: string[] = [];
  if (field.required) annotations.push(field.type === "string" || field.type === "text" ? "@NotBlank" : "@NotNull");
  if (field.constraints?.min !== undefined) {
    annotations.push(
      field.type === "string" || field.type === "text"
        ? `@Size(min = ${field.constraints.min})`
        : field.type === "decimal"
          ? `@DecimalMin("${field.constraints.min}")`
          : `@Min(${field.constraints.min})`,
    );
  }
  if (field.constraints?.max !== undefined) {
    if (field.type === "string" || field.type === "text") annotations.push(`@Size(max = ${field.constraints.max})`);
    else
      annotations.push(
        field.type === "decimal" ? `@DecimalMax("${field.constraints.max}")` : `@Max(${field.constraints.max})`,
      );
  }
  if (field.constraints?.pattern) annotations.push(`@Pattern(regexp = ${JSON.stringify(field.constraints.pattern)})`);
  return annotations;
}

function filterAnnotation(field: EntityFieldSchema, schema: VireoEntitySchema) {
  if (!schema.capabilities.query || !field.query?.filterable) return [];
  const operators =
    field.type === "string" || field.type === "text"
      ? "QueryOperator.CONTAINS, QueryOperator.EQUALS, QueryOperator.STARTS_WITH, QueryOperator.ENDS_WITH"
      : "QueryOperator.EQUALS, QueryOperator.NOT_EQUALS";
  return [`@Filterable(label = "${schema.entity.name}.${field.name}", operators = { ${operators} })`];
}

function entityField(field: EntityFieldSchema, schema: VireoEntitySchema) {
  const annotations = [...javaValidation(field)];
  if (field.type === "enum") annotations.push("@Enumerated(EnumType.STRING)");
  const length =
    field.type === "text"
      ? (field.constraints?.max ?? 2000)
      : field.type === "string"
        ? field.constraints?.max
        : undefined;
  const columnOptions = [
    `name = "${entityFieldSqlName(field.name)}"`,
    field.required ? "nullable = false" : "",
    field.unique ? "unique = true" : "",
    length ? `length = ${length}` : "",
  ].filter(Boolean);
  annotations.push(`@Column(${columnOptions.join(", ")})`.replace("()", ""));
  annotations.push(...filterAnnotation(field, schema));
  return `${annotations.map(value => `    ${value}`).join("\n")}\n    private ${javaType(field)} ${field.name};`;
}

function renderEnum(field: EntityFieldSchema, names: EntityNames, digest: string) {
  return `${generatedHeader("//", digest, "generated-once")}package ${names.packageName};

public enum ${upperFirst(field.name)} {
    ${field.enumValues!.join(",\n    ")}
}
`;
}

function renderEntity(schema: VireoEntitySchema, names: EntityNames, digest: string) {
  const queryImports = schema.capabilities.query
    ? `import com.vireocode.vireo.queryengine.Filterable;\nimport com.vireocode.vireo.queryengine.FilterableMetadata;\nimport com.vireocode.vireo.queryengine.QueryOperator;\n`
    : "";
  return `${generatedHeader("//", digest, "generated-once")}package ${names.packageName};

${javaImports(schema.fields)}${javaImports(schema.fields) ? "\n\n" : ""}import com.vireocode.vireo.base.BaseEntity;
${queryImports}
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "${schema.database.table}")
${schema.capabilities.query ? `@FilterableMetadata(title = "${names.fileStem}.title")\n` : ""}@Getter
@Setter
@NoArgsConstructor
public class ${names.className} extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

${schema.fields.map(field => entityField(field, schema)).join("\n\n")}
}
`;
}

function renderDto(schema: VireoEntitySchema, names: EntityNames, digest: string) {
  const components = [
    "Long id",
    ...schema.fields.map(
      field =>
        `${javaValidation(field).join(" ")}${javaValidation(field).length ? " " : ""}${javaType(field)} ${field.name}`,
    ),
  ];
  return `${generatedHeader("//", digest, "generated-once")}package ${names.packageName};

${javaImports(schema.fields)}${javaImports(schema.fields) ? "\n\n" : ""}import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ${names.className}DTO(
        ${components.join(",\n        ")}) {
}
`;
}

function renderMapper(names: EntityNames, digest: string) {
  return `${generatedHeader("//", digest, "generated-once")}package ${names.packageName};

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import com.vireocode.vireo.base.BaseMapper;
import com.vireocode.vireo.base.JsonNullableMapper;

@Mapper(uses = JsonNullableMapper.class, unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = "spring")
public interface ${names.className}Mapper extends BaseMapper<${names.className}, ${names.className}DTO> {

    @Override
    @Mapping(target = "id", ignore = true)
    ${names.className} toDomain(${names.className}DTO dto);

    @Override
    ${names.className}DTO toDto(${names.className} domain);

    @Override
    @Mapping(target = "id", ignore = true)
    void update(${names.className}DTO update, @MappingTarget ${names.className} destination);
}
`;
}

function renderRepository(names: EntityNames, digest: string) {
  return `${generatedHeader("//", digest, "generated-once")}package ${names.packageName};

import com.vireocode.vireo.base.SearchableRepository;

public interface ${names.className}Repository extends SearchableRepository<${names.className}, Long> {
}
`;
}

function renderHistoryType(names: EntityNames, digest: string) {
  return `${generatedHeader("//", digest, "generated-once")}package ${names.packageName};

import com.vireocode.vireo.base.HistoryEntityType;

public enum ${names.className}HistoryEntityType implements HistoryEntityType {
    ${names.constant}
}
`;
}

function renderService(schema: VireoEntitySchema, names: EntityNames, digest: string) {
  const searchable = schema.fields
    .filter(field => field.query?.searchable)
    .map(field => `"${field.name}"`)
    .join(", ");
  const history = schema.capabilities.history
    ? `.history(${names.className}HistoryEntityType.${names.constant})\n                `
    : "";
  return `${generatedHeader("//", digest, "generated-once")}package ${names.packageName};

import java.util.List;

import org.springframework.stereotype.Service;

import com.vireocode.vireo.base.BaseService;
import com.vireocode.vireo.base.EntityConfig;

@Service
public class ${names.className}Service extends BaseService<Long, ${names.className}, ${names.className}DTO> {

    public ${names.className}Service(${names.className}Repository repository, ${names.className}Mapper mapper) {
        super(repository, mapper, EntityConfig.builder()
                .localSearchableFields(List.of(${searchable}))
                .softDelete(true)
                ${history}.build());
    }
}
`;
}

function renderController(schema: VireoEntitySchema, names: EntityNames, digest: string) {
  return `${generatedHeader("//", digest, "generated-once")}package ${names.packageName};

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.vireocode.vireo.queryengine.QueryFilterRequest;
import com.vireocode.vireo.web.RestUtils;
import com.vireocode.vireo.web.SearchablePageable;

import jakarta.validation.Valid;

@RestController
@RequestMapping("${schema.api.path}")
public class ${names.className}Controller {

    private final ${names.className}Service service;

    public ${names.className}Controller(${names.className}Service service) {
        this.service = service;
    }

    @PostMapping("/search")
    @PreAuthorize(${JSON.stringify(schema.permissions.read)})
    public Page<${names.className}DTO> search(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "rowsPerPage", defaultValue = "10") int rowsPerPage,
            @RequestParam(name = "sortBy", defaultValue = "${schema.fields.find(field => field.query?.sortable)?.name ?? schema.fields[0].name}") String sortBy,
            @RequestParam(name = "sortDirection", defaultValue = "asc") String sortDirection,
            @RequestParam(name = "searchText", required = false) String searchText,
            @RequestBody(required = false) QueryFilterRequest filters) {
        SearchablePageable pageable = RestUtils.makePageable(page, rowsPerPage, sortBy, sortDirection, searchText);
        return service.findAll(pageable, filters);
    }

    @PostMapping
    @PreAuthorize(${JSON.stringify(schema.permissions.manage)})
    @ResponseStatus(HttpStatus.CREATED)
    public ${names.className}DTO create(@Valid @RequestBody ${names.className}DTO value) {
        return service.create(value);
    }

    @PutMapping("/{id}")
    @PreAuthorize(${JSON.stringify(schema.permissions.manage)})
    public ${names.className}DTO update(@PathVariable("id") Long id, @Valid @RequestBody ${names.className}DTO value) {
        return service.update(id, value);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(${JSON.stringify(schema.permissions.manage)})
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("id") Long id) {
        service.delete(id);
    }
}
`;
}

function renderQueryRegistration(names: EntityNames, digest: string) {
  return `${generatedHeader("//", digest, "generated-once")}package ${names.packageName};

import java.util.Map;

import org.springframework.stereotype.Component;

import com.vireocode.vireo.queryengine.QueryEntityKey;
import com.vireocode.vireo.queryengine.QueryEntityTypeResolver;

@Component
public class ${names.className}QueryRegistration implements QueryEntityTypeResolver {

    private enum Key implements QueryEntityKey {
        ${names.constant}
    }

    @Override
    public Map<QueryEntityKey, Class<?>> entityTypes() {
        return Map.of(Key.${names.constant}, ${names.className}.class);
    }
}
`;
}

function sqlType(field: EntityFieldSchema) {
  if (field.type === "enum") return `VARCHAR(${Math.max(16, ...field.enumValues!.map(value => value.length))})`;
  if (field.type === "string") return `VARCHAR(${field.constraints?.max ?? 255})`;
  if (field.type === "text") return `VARCHAR(${field.constraints?.max ?? 2000})`;
  const types: Record<Exclude<EntityFieldType, "enum" | "string" | "text">, string> = {
    boolean: "BOOLEAN",
    date: "DATE",
    decimal: "NUMERIC(19, 4)",
    integer: "INTEGER",
    long: "BIGINT",
    timestamp: "TIMESTAMP WITH TIME ZONE",
    uuid: "UUID",
  };
  return types[field.type];
}

function sqlDefault(field: EntityFieldSchema) {
  if (field.default === undefined) return "";
  if (typeof field.default === "boolean") return ` DEFAULT ${field.default ? "TRUE" : "FALSE"}`;
  if (typeof field.default === "number") return ` DEFAULT ${field.default}`;
  return ` DEFAULT '${field.default.replaceAll("'", "''")}'`;
}

function renderMigration(schema: VireoEntitySchema, names: EntityNames, digest: string) {
  const fields = schema.fields.map(field => {
    const constraints = `${field.required ? " NOT NULL" : ""}${field.unique ? " UNIQUE" : ""}${sqlDefault(field)}`;
    return `    ${entityFieldSqlName(field.name)} ${sqlType(field)}${constraints}`;
  });
  const audit = [
    "    created_at TIMESTAMP WITH TIME ZONE",
    "    modified_at TIMESTAMP WITH TIME ZONE",
    "    created_by VARCHAR(255)",
    "    modified_by VARCHAR(255)",
    "    keywords VARCHAR(2048)",
    "    deleted BOOLEAN NOT NULL DEFAULT FALSE",
  ];
  const checks = schema.fields
    .filter(field => field.type === "enum")
    .map(
      field =>
        `    CONSTRAINT ck_${schema.database.table}_${entityFieldSqlName(field.name)} CHECK (${entityFieldSqlName(field.name)} IN (${field.enumValues!.map(value => `'${value}'`).join(", ")}))`,
    );
  const columns = [...fields, ...audit, ...checks].join(",\n");
  const indexes = schema.fields
    .filter(field => field.query?.filterable || field.query?.searchable || field.query?.sortable)
    .map(
      field =>
        `CREATE INDEX IF NOT EXISTS ix_${schema.database.table}_${entityFieldSqlName(field.name)} ON ${schema.database.table} (${entityFieldSqlName(field.name)});`,
    )
    .join("\n");
  return `${generatedHeader("--", digest, "generated-once")}CREATE TABLE IF NOT EXISTS ${schema.database.table} (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
${columns}
);

${indexes}
`;
}

function zodField(field: EntityFieldSchema) {
  let value: string;
  if (field.type === "boolean") value = "z.boolean()";
  else if (field.type === "integer" || field.type === "long") value = "z.number().int()";
  else if (field.type === "decimal") value = "z.number()";
  else if (field.type === "enum") value = `z.enum(${JSON.stringify(field.enumValues)})`;
  else if (field.type === "date") value = "z.iso.date()";
  else if (field.type === "timestamp") value = "z.iso.datetime({ offset: true })";
  else if (field.type === "uuid") value = "z.uuid()";
  else value = "z.string()";
  if (field.constraints?.min !== undefined) {
    value +=
      field.type === "string" || field.type === "text"
        ? `.min(${field.constraints.min})`
        : `.min(${field.constraints.min})`;
  }
  if (field.constraints?.max !== undefined) value += `.max(${field.constraints.max})`;
  if (field.constraints?.pattern) value += `.regex(new RegExp(${JSON.stringify(field.constraints.pattern)}, "u"))`;
  if (!field.required) value += ".nullable()";
  return value;
}

function defaultValue(field: EntityFieldSchema) {
  if (field.default !== undefined) return JSON.stringify(field.default);
  if (!field.required) return "null";
  if (field.type === "boolean") return "false";
  if (field.type === "integer" || field.type === "long" || field.type === "decimal") return "0";
  if (field.type === "enum") return JSON.stringify(field.enumValues![0]);
  return '""';
}

function renderModel(schema: VireoEntitySchema, names: EntityNames, digest: string) {
  return `${generatedHeader("//", digest, "generated-once")}import { z } from "zod";

export const ${names.className}TransportSchema = z.object({
  id: z.number().int().nonnegative(),
${schema.fields.map(field => `  ${field.name}: ${zodField(field)},`).join("\n")}
});

export type ${names.className}Transport = z.infer<typeof ${names.className}TransportSchema>;

// Domain and transport models are deliberately separate even while v1 maps them one-to-one.
export const ${names.className}Schema = ${names.className}TransportSchema.transform(value => ({ ...value }));
export type ${names.className} = z.infer<typeof ${names.className}Schema>;

export function ${names.fileStem}FromTransport(value: unknown): ${names.className} {
  return ${names.className}Schema.parse(value);
}

export function ${names.fileStem}ToTransport(value: ${names.className}): ${names.className}Transport {
  return ${names.className}TransportSchema.parse(value);
}

export function createDefault${names.className}(): ${names.className} {
  return {
    id: 0,
${schema.fields.map(field => `    ${field.name}: ${defaultValue(field)},`).join("\n")}
  };
}
`;
}

function renderApi(schema: VireoEntitySchema, names: EntityNames, digest: string) {
  const endpoint = schema.api.path.replace(/^\/api\//u, "").replace(/^\//u, "");
  return `${generatedHeader("//", digest, "generated-once")}import { z } from "zod";
import type { PageableParams, PageableResponse } from "@vireocodedev/infrastructure";
import { createAdapterSlot } from "@/app/adapters/createAdapterSlot";
import { AppAxiosHttpClient, postAppPagedSearch } from "@/app/data/network/clients/AppAxiosClient";
import {
  ${names.className}Schema,
  ${names.fileStem}ToTransport,
  type ${names.className},
} from "../models/${names.className}";

export interface ${names.className}Api {
  search(pageable: PageableParams, searchText: string, signal?: AbortSignal): Promise<PageableResponse<${names.className}>>;
  create(value: ${names.className}): Promise<${names.className}>;
  update(id: number, value: ${names.className}): Promise<${names.className}>;
  delete(id: number): Promise<void>;
}

export class ${names.className}HttpApi extends AppAxiosHttpClient implements ${names.className}Api {
  constructor() {
    super(${JSON.stringify(endpoint)});
  }

  search(pageable: PageableParams, searchText: string, signal?: AbortSignal): Promise<PageableResponse<${names.className}>> {
    return postAppPagedSearch({
      endpointName: ${JSON.stringify(endpoint)},
      schema: ${names.className}Schema,
      pageable,
      filters: { searchText },
      config: { signal },
    });
  }

  create(value: ${names.className}): Promise<${names.className}> {
    return this.httpPost(${names.className}Schema)("", { ...${names.fileStem}ToTransport(value), id: null });
  }

  update(id: number, value: ${names.className}): Promise<${names.className}> {
    return this.httpPut(${names.className}Schema)(String(id), { ...${names.fileStem}ToTransport(value), id });
  }

  async delete(id: number): Promise<void> {
    await this.httpDelete(z.unknown())(String(id));
  }
}

const ${names.fileStem}ApiSlot = createAdapterSlot<${names.className}Api>(new ${names.className}HttpApi());

export const ${names.fileStem}Api = ${names.fileStem}ApiSlot.adapter;
export const configure${names.className}Api = ${names.fileStem}ApiSlot.configure;
`;
}

function inputControl(field: EntityFieldSchema, names: EntityNames) {
  const label = `{copy.fields.${field.name}}`;
  if (field.type === "boolean")
    return `<FormControlLabel control={<Checkbox checked={draft.${field.name} ?? false} onChange={event => setField("${field.name}", event.target.checked)} />} label=${label} />`;
  if (field.type === "enum")
    return `<TextField select fullWidth label=${label} value={draft.${field.name} ?? ""} onChange={event => setField("${field.name}", event.target.value as ${names.className}["${field.name}"])} required={${Boolean(field.required)}}>
              ${field.enumValues!.map(value => `<MenuItem value=${JSON.stringify(value)}>${value}</MenuItem>`).join("\n              ")}
            </TextField>`;
  const numeric = field.type === "integer" || field.type === "long" || field.type === "decimal";
  const multiline = field.type === "text" || field.ui?.control === "textarea";
  return `<TextField fullWidth label=${label} type=${JSON.stringify(numeric ? "number" : field.type === "date" ? "date" : "text")} value={draft.${field.name} ?? ""} onChange={event => setField("${field.name}", (${numeric ? `event.target.value === "" ? ${field.required ? "0" : "null"} : Number(event.target.value)` : "event.target.value"}) as ${names.className}["${field.name}"])} required={${Boolean(field.required)}}${multiline ? " multiline minRows={3}" : ""} />`;
}

function renderPage(schema: VireoEntitySchema, names: EntityNames, digest: string) {
  const listFields = schema.fields.filter(field => field.ui?.list !== false).slice(0, 4);
  const primary = schema.fields.find(field => field.query?.searchable) ?? schema.fields[0];
  const muiImports = [
    "Alert",
    "Box",
    "Button",
    ...(schema.fields.some(field => field.type === "boolean") ? ["Checkbox"] : []),
    "CircularProgress",
    "Dialog",
    "DialogActions",
    "DialogContent",
    "DialogTitle",
    ...(schema.fields.some(field => field.type === "boolean") ? ["FormControlLabel"] : []),
    ...(schema.fields.some(field => field.type === "enum") ? ["MenuItem"] : []),
    "Paper",
    "Stack",
    "TextField",
    "Typography",
  ];
  return `${generatedHeader("//", digest, "generated-once")}import React from "react";
import {
  ${muiImports.join(",\n  ")},
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppPreferences } from "@/app/ui/preferences/hooks/useAppPreferences";
import { ${names.fileStem}Api } from "../api/${names.fileStem}.api";
import { createDefault${names.className}, ${names.className}Schema, type ${names.className} } from "../models/${names.className}";
import en from "../localization/${names.fileStem}.en";
import hr from "../localization/${names.fileStem}.hr";

const queryKey = [${JSON.stringify(names.plural)}] as const;

export function ${names.pageClass}() {
  const queryClient = useQueryClient();
  const { preferences } = useAppPreferences();
  const copy = preferences.locale === "hr" ? hr : en;
  const [searchText, setSearchText] = React.useState("");
  const [draft, setDraft] = React.useState<${names.className} | null>(null);
  const result = useQuery({
    queryKey: [...queryKey, searchText],
    queryFn: ({ signal }) => ${names.fileStem}Api.search({ page: 0, rowsPerPage: 25, sortBy: ${JSON.stringify(primary.name)}, sortDirection: "asc" }, searchText, signal),
  });
  const save = useMutation({
    mutationFn: (value: ${names.className}) => {
      const validated = ${names.className}Schema.parse(value);
      return validated.id === 0 ? ${names.fileStem}Api.create(validated) : ${names.fileStem}Api.update(validated.id, validated);
    },
    onSuccess: () => { setDraft(null); void queryClient.invalidateQueries({ queryKey }); },
  });
  const remove = useMutation({
    mutationFn: (value: ${names.className}) => ${names.fileStem}Api.delete(value.id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey }),
  });
  const setField = <K extends keyof ${names.className}>(field: K, value: ${names.className}[K]) =>
    setDraft(current => current ? { ...current, [field]: value } : current);

  return (
    <Box sx={{ height: "100%", overflow: "auto", p: { xs: 2, md: 3 } }}>
      <Stack spacing={2}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ justifyContent: "space-between" }}>
          <Box><Typography variant="h4">{copy.header.title}</Typography><Typography color="text.secondary">{copy.header.description}</Typography></Box>
          <Button variant="contained" onClick={() => setDraft(createDefault${names.className}())}>{copy.actions.create}</Button>
        </Stack>
        <TextField label={copy.actions.search} value={searchText} onChange={event => setSearchText(event.target.value)} />
        {result.isLoading ? <Stack role="status" direction="row" spacing={1}><CircularProgress size={20} /><span>{copy.states.loading}</span></Stack> : null}
        {result.isError ? <Alert severity="error" action={<Button onClick={() => void result.refetch()}>{copy.actions.retry}</Button>}>{copy.states.loadError}</Alert> : null}
        {!result.isLoading && !result.isError && result.data?.content.length === 0 ? <Paper sx={{ p: 3, textAlign: "center" }}>{copy.states.empty}</Paper> : null}
        <Stack spacing={1}>
          {result.data?.content.map(value => <Paper key={value.id} sx={{ p: 2 }}><Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: { sm: "center" } }}><Box sx={{ flex: 1 }}>${listFields.map((field, index) => (index === 0 ? `<Typography sx={{ fontWeight: 700 }}>{String(value.${field.name} ?? "—")}</Typography>` : `<Typography color="text.secondary" variant="body2">{String(value.${field.name} ?? "—")}</Typography>`)).join("")}</Box><Stack direction="row" spacing={1}><Button onClick={() => setDraft(value)}>{copy.actions.edit}</Button><Button color="error" disabled={remove.isPending} onClick={() => void remove.mutateAsync(value)}>{copy.actions.delete}</Button></Stack></Stack></Paper>)}
        </Stack>
      </Stack>
      <Dialog open={draft !== null} onClose={() => setDraft(null)} fullWidth maxWidth="sm">
        <DialogTitle>{draft?.id ? copy.actions.edit : copy.actions.create}</DialogTitle>
        <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
          {draft ? <>
            ${schema.fields.map(field => inputControl(field, names)).join("\n            ")}
          </> : null}
          {save.isError ? <Alert severity="error">{copy.states.saveError}</Alert> : null}
        </Stack></DialogContent>
        <DialogActions><Button onClick={() => setDraft(null)}>{copy.actions.cancel}</Button><Button variant="contained" disabled={!draft || save.isPending} onClick={() => draft && void save.mutateAsync(draft)}>{copy.actions.save}</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
`;
}

function renderLocalization(schema: VireoEntitySchema, locale: "en" | "hr", digest: string) {
  const names = schema.localization[locale] ?? schema.localization.en;
  const actions =
    locale === "hr"
      ? {
          cancel: "Odustani",
          create: `Izradi: ${names.singular}`,
          delete: "Izbriši",
          edit: "Uredi",
          retry: "Pokušaj ponovno",
          save: "Spremi",
          search: "Pretraži",
        }
      : {
          cancel: "Cancel",
          create: `Create ${names.singular.toLocaleLowerCase("en-US")}`,
          delete: "Delete",
          edit: "Edit",
          retry: "Retry",
          save: "Save",
          search: "Search",
        };
  const states =
    locale === "hr"
      ? {
          empty: `Još nema: ${names.plural}.`,
          loadError: `Nije moguće učitati: ${names.plural}.`,
          loading: `Učitavanje: ${names.plural}.`,
          saveError: `Nije moguće spremiti: ${names.singular}.`,
        }
      : {
          empty: `No ${names.plural.toLocaleLowerCase("en-US")} yet.`,
          loadError: `Could not load ${names.plural.toLocaleLowerCase("en-US")}.`,
          loading: `Loading ${names.plural.toLocaleLowerCase("en-US")}.`,
          saveError: `Could not save ${names.singular.toLocaleLowerCase("en-US")}.`,
        };
  return `${generatedHeader("//", digest, "generated-once")}const resources = {
  header: {
    title: ${JSON.stringify(names.plural)},
    description: ${JSON.stringify(schema.entity.description ?? `Manage ${names.plural.toLocaleLowerCase(locale === "hr" ? "hr-HR" : "en-US")}.`)},
  },
  title: ${JSON.stringify(names.plural)},
  singular: ${JSON.stringify(names.singular)},
  plural: ${JSON.stringify(names.plural)},
  actions: ${JSON.stringify(actions)},
  states: ${JSON.stringify(states)},
  fields: {
${schema.fields.map(field => `    ${field.name}: ${JSON.stringify(field.ui?.label ?? field.name)},`).join("\n")}
  },
} as const;

export default resources;
`;
}

function renderCapability(schema: VireoEntitySchema, names: EntityNames, digest: string) {
  return `${generatedHeader("//", digest, "generated-once")}import en from "./localization/${names.fileStem}.en";
import hr from "./localization/${names.fileStem}.hr";

export const ${names.fileStem}Capability = {
  id: ${JSON.stringify(names.routeId)},
  path: ${JSON.stringify(schema.api.path.replace(/^\/api/u, ""))},
  navigationLabels: { en: ${JSON.stringify(schema.localization.en.plural)}, hr: ${JSON.stringify(schema.localization.hr?.plural ?? schema.localization.en.plural)} },
  navigationOrder: 100,
  namespace: ${JSON.stringify(names.fileStem)},
  resources: { en, hr },
  load: async () => ({ default: (await import("./pages/${names.pageClass}")).${names.pageClass} }),
} as const;
`;
}

function renderStory(schema: VireoEntitySchema, names: EntityNames, digest: string) {
  return `${generatedHeader("//", digest, "generated-once")}import type { Meta, StoryObj } from "@storybook/react-vite";
import { ${names.pageClass} } from "../pages/${names.pageClass}";

const meta = {
  title: "Generated/${schema.localization.en.plural}",
  component: ${names.pageClass},
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ${names.pageClass}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
`;
}

function sampleValue(field: EntityFieldSchema, valid: boolean): unknown {
  if (!valid && field.required) return null;
  if (field.example !== undefined) return field.example;
  if (field.default !== undefined) return field.default;
  if (field.type === "boolean") return true;
  if (field.type === "integer" || field.type === "long")
    return field.constraints?.min ?? (field.constraints?.max !== undefined ? Math.min(1, field.constraints.max) : 1);
  if (field.type === "decimal")
    return (
      field.constraints?.min ?? (field.constraints?.max !== undefined ? Math.min(12.5, field.constraints.max) : 12.5)
    );
  if (field.type === "enum") return field.enumValues![0];
  if (field.type === "date") return "2026-08-27";
  if (field.type === "timestamp") return "2026-08-27T12:00:00Z";
  if (field.type === "uuid") return "123e4567-e89b-12d3-a456-426614174000";
  const minimumLength = field.constraints?.min ?? 1;
  const maximumLength = field.constraints?.max;
  const length =
    maximumLength === undefined ? Math.max(1, minimumLength) : Math.min(Math.max(1, minimumLength), maximumLength);
  return "X".repeat(length);
}

function renderFrontendTest(schema: VireoEntitySchema, names: EntityNames, digest: string) {
  const valid = Object.fromEntries([["id", 1], ...schema.fields.map(field => [field.name, sampleValue(field, true)])]);
  const required = schema.fields.find(field => field.required);
  return `${generatedHeader("//", digest, "generated-once")}import { describe, expect, it } from "vitest";
import { ${names.className}TransportSchema } from "@/generated/${names.plural}/models/${names.className}";

describe("${names.className} generated wire contract", () => {
  it("accepts the canonical transport fixture", () => {
    expect(${names.className}TransportSchema.parse(${JSON.stringify(valid, null, 2)}).id).toBe(1);
  });
${
  required
    ? `
  it("rejects a null required field", () => {
    expect(() => ${names.className}TransportSchema.parse({ ...${JSON.stringify(valid)}, ${required.name}: null })).toThrow();
  });
`
    : ""
}});
`;
}

function renderBackendTest(schema: VireoEntitySchema, names: EntityNames, digest: string) {
  const valid = Object.fromEntries(schema.fields.map(field => [field.name, sampleValue(field, true)]));
  return `${generatedHeader("//", digest, "generated-once")}package ${names.packageName};

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ${names.className}ApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser(roles = "SUPERADMIN")
    void generatedCreateAndSearchContractPasses() throws Exception {
        mockMvc.perform(post("${schema.api.path}")
                .with(csrf())
                .contentType("application/json")
                .content("""
${JSON.stringify(valid, null, 2)
  .split("\n")
  .map(line => `                        ${line}`)
  .join("\n")}
                        """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber());

        mockMvc.perform(post("${schema.api.path}/search")
                .with(csrf())
                .contentType("application/json"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").isNumber());
    }
}
`;
}

function renderDocumentation(
  schema: VireoEntitySchema,
  names: EntityNames,
  digest: string,
  target: VireoGenerationTarget,
) {
  return `<!-- @vireo-generated-once schema-v1 digest:${digest} -->
# ${schema.localization.en.singular} capability

Generated from the canonical Vireo entity schema for \`${schema.entity.name}\`.

- API: \`${schema.api.path}\`
- Generation target: \`${target}\`
${target === "full-stack" ? `- Table: \`${schema.database.table}\`` : "- Backend ownership: external; implement or inject the generated TypeScript API interface"}
- History: ${schema.capabilities.history ? "enabled" : "disabled"}
- Query filtering: ${schema.capabilities.query ? "enabled" : "disabled"}
- Offline replay: disabled in schema v1; Phase 4 owns offline guarantees

The ${target === "full-stack" ? "Java, migration, and " : ""}TypeScript, page, story, and test files are generated once and are now application-owned. Run \`vireo check\` to detect contract drift. Run \`vireo eject ${names.plural}\` before deliberately breaking the generated wire contract.
`;
}

export function renderEntityFiles(
  schema: VireoEntitySchema,
  project: VireoProjectMetadata,
  schemaDigest: string,
  target: VireoGenerationTarget = "full-stack",
): GeneratedFile[] {
  const names = entityNames(schema, project);
  const javaMain = `src/main/java/${names.packagePath}`;
  const javaTest = `src/test/java/${names.packagePath}`;
  const frontendRoot = project.profile === "frontend" ? "" : "frontend/";
  const frontend = `${frontendRoot}src/generated/${names.plural}`;
  const files: GeneratedFile[] = [
    {
      path: `${frontend}/models/${names.className}.ts`,
      content: renderModel(schema, names, schemaDigest),
      ownership: "generated-once",
      role: "frontend",
    },
    {
      path: `${frontend}/api/${names.fileStem}.api.ts`,
      content: renderApi(schema, names, schemaDigest),
      ownership: "generated-once",
      role: "frontend",
    },
    {
      path: `${frontend}/pages/${names.pageClass}.tsx`,
      content: renderPage(schema, names, schemaDigest),
      ownership: "generated-once",
      role: "frontend",
    },
    {
      path: `${frontend}/localization/${names.fileStem}.en.ts`,
      content: renderLocalization(schema, "en", schemaDigest),
      ownership: "generated-once",
      role: "frontend",
    },
    {
      path: `${frontend}/localization/${names.fileStem}.hr.ts`,
      content: renderLocalization(schema, "hr", schemaDigest),
      ownership: "generated-once",
      role: "frontend",
    },
    {
      path: `${frontend}/storybook/${names.pageClass}.stories.tsx`,
      content: renderStory(schema, names, schemaDigest),
      ownership: "generated-once",
      role: "test",
    },
    {
      path: `${frontend}/${names.fileStem}.capability.ts`,
      content: renderCapability(schema, names, schemaDigest),
      ownership: "generated-once",
      role: "registry",
    },
    {
      path: `${frontendRoot}tests/contract/generated/${names.fileStem}.wire-contract.test.ts`,
      content: renderFrontendTest(schema, names, schemaDigest),
      ownership: "generated-once",
      role: "test",
    },
    {
      path: `docs/generated/${names.plural}.md`,
      content: renderDocumentation(schema, names, schemaDigest, target),
      ownership: "generated-once",
      role: "documentation",
    },
  ];
  if (target === "full-stack")
    files.push(
      {
        path: `${javaMain}/${names.className}.java`,
        content: renderEntity(schema, names, schemaDigest),
        ownership: "generated-once",
        role: "backend",
      },
      {
        path: `${javaMain}/${names.className}DTO.java`,
        content: renderDto(schema, names, schemaDigest),
        ownership: "generated-once",
        role: "backend",
      },
      {
        path: `${javaMain}/${names.className}Mapper.java`,
        content: renderMapper(names, schemaDigest),
        ownership: "generated-once",
        role: "backend",
      },
      {
        path: `${javaMain}/${names.className}Repository.java`,
        content: renderRepository(names, schemaDigest),
        ownership: "generated-once",
        role: "backend",
      },
      {
        path: `${javaMain}/${names.className}Service.java`,
        content: renderService(schema, names, schemaDigest),
        ownership: "generated-once",
        role: "backend",
      },
      {
        path: `${javaMain}/${names.className}Controller.java`,
        content: renderController(schema, names, schemaDigest),
        ownership: "generated-once",
        role: "backend",
      },
      {
        path: `src/main/resources/db/migration/V${schema.database.migrationVersion}__create_${schema.database.table}.sql`,
        content: renderMigration(schema, names, schemaDigest),
        ownership: "generated-once",
        role: "migration",
      },
      {
        path: `${javaTest}/${names.className}ApiIntegrationTest.java`,
        content: renderBackendTest(schema, names, schemaDigest),
        ownership: "generated-once",
        role: "test",
      },
    );
  if (target === "full-stack" && schema.capabilities.history)
    files.push({
      path: `${javaMain}/${names.className}HistoryEntityType.java`,
      content: renderHistoryType(names, schemaDigest),
      ownership: "generated-once",
      role: "backend",
    });
  if (target === "full-stack" && schema.capabilities.query)
    files.push({
      path: `${javaMain}/${names.className}QueryRegistration.java`,
      content: renderQueryRegistration(names, schemaDigest),
      ownership: "generated-once",
      role: "backend",
    });
  for (const field of target === "full-stack" ? schema.fields.filter(field => field.type === "enum") : [])
    files.push({
      path: `${javaMain}/${upperFirst(field.name)}.java`,
      content: renderEnum(field, names, schemaDigest),
      ownership: "generated-once",
      role: "backend",
    });
  return files.sort((left, right) => left.path.localeCompare(right.path));
}

export function renderCapabilityRegistry(capabilities: Array<{ plural: string; fileStem: string }>) {
  const sorted = [...capabilities].sort((left, right) => left.plural.localeCompare(right.plural));
  return `// @vireo-regenerated schema-v1 -- do not customize; run vireo eject first.\n${sorted
    .map(
      value =>
        `import { ${value.fileStem}Capability } from "@/generated/${value.plural}/${value.fileStem}.capability";`,
    )
    .join("\n")}

export const VIREO_GENERATED_CAPABILITIES = [${sorted.map(value => `${value.fileStem}Capability`).join(", ")}] as const;
`;
}
