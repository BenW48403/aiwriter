class ErrorHandler:
    @staticmethod
    def handle_file_not_found_error(file_path):
        return f'The file {file_path} does not exist'

    @staticmethod
    def handle_file_already_exists_error(file_path):
        return f'The file {file_path} already exists'

    @staticmethod
    def handle_tag_not_found_error(tag_name):
        return f'The tag {tag_name} does not exist'

    @staticmethod
    def handle_tag_already_exists_error(tag_name):
        return f'The tag {tag_name} already exists'
