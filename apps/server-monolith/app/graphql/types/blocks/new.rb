# frozen_string_literal: true

module Types
  module Blocks
    class New < Types::BaseObject
      graphql_name 'BlockNew'
      description 'MashCard Docs::Block New Scheme'

      has_primary_key uuid: true

      field :block_type, String, 'Block Type'
      field :state_id, String, 'Latest State Id', null: true
      field :states, [State], 'Block States', null: true, method: :states_sorted
      field :states_count, Integer, null: true

      field :blobs, [Types::Blob], 'blobs', null: true
      field :document_info, DocumentInfo, null: true

      def states_count
        object.states.count
      end

      def document_info
        # TODO: only if is document
        object
      end
    end
  end
end
